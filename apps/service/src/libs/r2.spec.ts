import { describe, expect, it } from "vitest";
import { generateTempModerationKey } from "./r2";

describe("generateTempModerationKey", () => {
  it("moderationプレフィクス付きのキーを生成する", () => {
    expect(generateTempModerationKey("abc123")).toBe("moderation/abc123");
  });

  it("worker側と同じキーになるよう英数字・アンダースコア・ハイフン以外を除去する", () => {
    expect(generateTempModerationKey("ab/c.1_2-3")).toBe("moderation/abc1_2-3");
  });

  it("パストラバーサルになりうる文字列を無害化する", () => {
    expect(generateTempModerationKey("../../etc/passwd")).toBe("moderation/etcpasswd");
  });
});
