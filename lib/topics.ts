export const DEFAULT_TOPICS = [
  "What is a crypto trading bot",
  "Risks of automated crypto trading",
  "How crypto signal bots work",
  "Spot vs futures bots",
  "Telegram crypto bots overview",
  "Beginner guide to trading automation",
  "Risk management for crypto bots",
  "API security for trading bots",
] as const;

export type ArticleTopic = (typeof DEFAULT_TOPICS)[number];

export function pickTopic(date: Date = new Date()): ArticleTopic {
  const seed = date.getUTCDate() + date.getUTCMonth();
  return DEFAULT_TOPICS[seed % DEFAULT_TOPICS.length];
}
