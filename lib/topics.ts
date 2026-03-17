export const DEFAULT_TOPICS: string[] = [
  "What is a crypto trading bot",
  "Risks of automated crypto trading",
  "How crypto signal bots work",
  "Spot vs futures bots",
  "Telegram crypto bots overview",
  "Beginner guide to trading automation",
  "Risk management for crypto bots",
  "API security for trading bots",
];

export function pickTopic(): string {
  const seed = new Date().getUTCDate() + new Date().getUTCMonth();
  return DEFAULT_TOPICS[seed % DEFAULT_TOPICS.length];
}
