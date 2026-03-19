export type TopicItem = {
  topic: string;
  cluster: string;
  keywords: string[];
};

export const TOPICS: TopicItem[] = [
  // TON payments
  {
    topic: 'How to accept TON payments in Telegram',
    cluster: 'ton-payments',
    keywords: ['TON payments', 'Telegram payments', 'TON bot']
  },
  {
    topic: 'TON payments for online businesses',
    cluster: 'ton-payments',
    keywords: ['accept TON', 'crypto checkout', 'TON payment']
  },
  {
    topic: 'How to use TON for digital product payments',
    cluster: 'ton-payments',
    keywords: ['TON payments', 'digital goods', 'Telegram']
  },
  {
    topic: 'TON payments vs traditional crypto payments',
    cluster: 'ton-payments',
    keywords: ['TON vs crypto', 'fees', 'speed']
  },
  {
    topic: 'Best ways to accept TON payments in 2026',
    cluster: 'ton-payments',
    keywords: ['TON payments', 'future crypto payments']
  },

  // Telegram bots
  {
    topic: 'How Telegram bots can accept TON payments',
    cluster: 'telegram-bots',
    keywords: ['Telegram bot', 'TON bot', 'payments']
  },
  {
    topic: 'Building a Telegram crypto bot with TON',
    cluster: 'telegram-bots',
    keywords: ['Telegram bot', 'TON API']
  },
  {
    topic: 'TON Connect for Telegram bots explained',
    cluster: 'telegram-bots',
    keywords: ['TON Connect', 'Telegram integration']
  },
  {
    topic: 'Telegram wallet integration with TON',
    cluster: 'telegram-bots',
    keywords: ['TON wallet', 'Telegram bot']
  },
  {
    topic: 'How bots handle crypto payments in Telegram',
    cluster: 'telegram-bots',
    keywords: ['crypto bot', 'Telegram payments']
  },

  // Wallet / beginner
  {
    topic: 'What is TON blockchain and how it works',
    cluster: 'education',
    keywords: ['TON blockchain', 'how TON works']
  },
  {
    topic: 'How to create a TON wallet step by step',
    cluster: 'education',
    keywords: ['TON wallet', 'setup']
  },
  {
    topic: 'How TON transactions work',
    cluster: 'education',
    keywords: ['TON transactions', 'fees']
  },
  {
    topic: 'TON vs Ethereum fees comparison',
    cluster: 'education',
    keywords: ['TON vs Ethereum']
  },
  {
    topic: 'Is TON safe for payments',
    cluster: 'education',
    keywords: ['TON security']
  },

  // Business
  {
    topic: 'How businesses can accept crypto payments in Telegram',
    cluster: 'business',
    keywords: ['crypto payments', 'Telegram business']
  },
  {
    topic: 'TON payment gateway for small businesses',
    cluster: 'business',
    keywords: ['TON gateway', 'payments']
  },
  {
    topic: 'Accept crypto as a freelancer using TON',
    cluster: 'business',
    keywords: ['freelancer crypto', 'TON']
  },
  {
    topic: 'Crypto payments for SaaS using TON',
    cluster: 'business',
    keywords: ['SaaS crypto payments']
  },
  {
    topic: 'Telegram payments for online services',
    cluster: 'business',
    keywords: ['Telegram payments']
  }
];
