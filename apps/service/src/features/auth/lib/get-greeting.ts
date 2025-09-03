/**
 * 現在の時間に基づいて適切な挨拶を返す関数
 * @returns 挨拶
 */
export function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "おはようございます！";
  }

  if (hour >= 12 && hour < 18) {
    return "こんにちは！";
  }

  return "こんばんは！";
}
