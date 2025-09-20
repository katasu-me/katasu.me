import type { DBActionError } from "../types/error";

/**
 * DBActionErrorかどうかを判定する
 * @param error - 判定するオブジェクト
 * @returns DBActionErrorであればtrue、それ以外はfalse
 */
export function isDBAcrionError(error: unknown): error is DBActionError {
  if (typeof error === "object" && error !== null) {
    return "message" in error && typeof error.message === "string";
  }

  return false;
}
