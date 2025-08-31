import { beforeEach, describe, expect, setSystemTime, test } from "bun:test";
import { getGreeting } from "./get-greeting";

describe("getGreeting", () => {
  beforeEach(() => {
    setSystemTime(new Date(2024, 0, 1, 0, 0, 0));
  });

  test("5時から11時59分までは「おはようございます！」を返す", () => {
    const testCases = [5, 6, 7, 8, 9, 10, 11];

    for (const hour of testCases) {
      setSystemTime(new Date(2024, 0, 1, hour, 0, 0));
      expect(getGreeting()).toBe("おはようございます！");
    }
  });

  test("12時から17時59分までは「こんにちは！」を返す", () => {
    const testCases = [12, 13, 14, 15, 16, 17];

    for (const hour of testCases) {
      setSystemTime(new Date(2024, 0, 1, hour, 0, 0));
      expect(getGreeting()).toBe("こんにちは！");
    }
  });

  test("18時から4時59分までは「こんばんは！」を返す", () => {
    const testCases = [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4];

    for (const hour of testCases) {
      setSystemTime(new Date(2024, 0, 1, hour, 0, 0));
      expect(getGreeting()).toBe("こんばんは！");
    }
  });

  test("境界値で正しい挨拶を返す", () => {
    // 4:59 -> こんばんは
    setSystemTime(new Date(2024, 0, 1, 4, 59, 59));
    expect(getGreeting()).toBe("こんばんは！");

    // 5:00 -> おはようございます
    setSystemTime(new Date(2024, 0, 1, 5, 0, 0));
    expect(getGreeting()).toBe("おはようございます！");

    // 11:59 -> おはようございます
    setSystemTime(new Date(2024, 0, 1, 11, 59, 59));
    expect(getGreeting()).toBe("おはようございます！");

    // 12:00 -> こんにちは
    setSystemTime(new Date(2024, 0, 1, 12, 0, 0));
    expect(getGreeting()).toBe("こんにちは！");

    // 17:59 -> こんにちは
    setSystemTime(new Date(2024, 0, 1, 17, 59, 59));
    expect(getGreeting()).toBe("こんにちは！");

    // 18:00 -> こんばんは
    setSystemTime(new Date(2024, 0, 1, 18, 0, 0));
    expect(getGreeting()).toBe("こんばんは！");
  });
});
