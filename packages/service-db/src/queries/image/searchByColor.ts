import { and, between, desc, eq, gte, isNotNull, lte, or, type SQL } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { createDBActionError } from "../../lib/error";
import { type ImageWithTags, image } from "../../schema";
import type { ActionResult } from "../../types/error";
import { getDB } from "../db";
import { DEFAULT_FETCH_IMAGES_LIMIT } from "./fetch";

export type ColorProximityOptions = {
  /** 色相の許容範囲 (デフォルト: 15) */
  hRange?: number;
  /** 彩度の許容範囲 (デフォルト: 20) */
  sRange?: number;
  /** 明度の許容範囲 (デフォルト: 20) */
  lRange?: number;
  /** 取得件数 */
  limit?: number;
  /** オフセット */
  offset?: number;
};

/** 無彩色と判定する彩度の閾値 */
const ACHROMATIC_SATURATION_THRESHOLD = 15;

/**
 * 近似色で画像を検索する
 *
 * 指定したHSL値に近い平均色を持つ画像を検索します。
 * 彩度が低い場合（無彩色）は色相を無視して検索します。
 *
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @param targetH 目標の色相 (0-360)
 * @param targetS 目標の彩度 (0-100)
 * @param targetL 目標の明度 (0-100)
 * @param opts オプション
 * @returns 画像一覧
 */
export async function fetchImagesByColorProximity(
  dbInstance: AnyD1Database,
  userId: string,
  targetH: number,
  targetS: number,
  targetL: number,
  opts: ColorProximityOptions = {},
): Promise<ActionResult<ImageWithTags[]>> {
  try {
    const db = getDB(dbInstance);

    const hRange = opts.hRange ?? 15;
    const sRange = opts.sRange ?? 20;
    const lRange = opts.lRange ?? 20;

    // 彩度の範囲
    const sMin = Math.max(0, targetS - sRange);
    const sMax = Math.min(100, targetS + sRange);

    // 明度の範囲
    const lMin = Math.max(0, targetL - lRange);
    const lMax = Math.min(100, targetL + lRange);

    // 色相の条件（無彩色の場合は色相を無視）
    const isAchromatic = targetS < ACHROMATIC_SATURATION_THRESHOLD;

    let hueCondition: SQL | undefined;

    if (isAchromatic) {
      hueCondition = lte(image.avgColorS, ACHROMATIC_SATURATION_THRESHOLD);
    } else {
      // 有彩色: 色相範囲で検索
      const hMin = (targetH - hRange + 360) % 360;
      const hMax = (targetH + hRange) % 360;

      // 色相が0をまたぐ場合（例: 350-10 は赤系）
      hueCondition =
        hMin > hMax ? or(gte(image.avgColorH, hMin), lte(image.avgColorH, hMax)) : between(image.avgColorH, hMin, hMax);
    }

    const results = await db.query.image.findMany({
      where: and(
        eq(image.userId, userId),
        eq(image.status, "published"),
        isNotNull(image.avgColorH),
        isNotNull(image.avgColorS),
        isNotNull(image.avgColorL),
        hueCondition,
        between(image.avgColorS, sMin, sMax),
        between(image.avgColorL, lMin, lMax),
      ),
      orderBy: [desc(image.createdAt)],
      limit: opts.limit ?? DEFAULT_FETCH_IMAGES_LIMIT,
      offset: opts.offset ?? 0,
      with: {
        imageTag: {
          with: {
            tag: {
              columns: {
                userId: false,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: results.map((result) => {
        const { imageTag, ...imageData } = result;

        return {
          ...imageData,
          tags: imageTag.map((it) => it.tag),
        };
      }),
    };
  } catch (error) {
    return createDBActionError("近似色での画像検索に失敗しました", error);
  }
}
