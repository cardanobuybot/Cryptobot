export type AffiliateLink = {
  id: string;
  slug: string;
  partnerName: string;
  destinationUrl: string;
  active: boolean;
  category: 'wallet' | 'exchange' | 'education' | 'social';
  notes?: string;
};

export type FaqItem = { question: string; answer: string };

export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  type: 'review' | 'guide' | 'comparison' | 'fees' | 'security' | 'country' | 'europe';
  ctaSlug: string;
  intro: string;
  pros: string[];
  cons: string[];
  faq: FaqItem[];
  related: string[];
  sections: { heading: string; content: string[] }[];
};
