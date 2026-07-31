export type Theme = 'dark' | 'light';

export interface ProductColor {
  id: string;
  label: string;
  shortLabel: string;
  hex: string;
  shadow: string;
  priceDelta: number;
  description: string;
}

export interface ProductAttribute {
  id: string;
  label: string;
  description: string;
  priceDelta: number;
  visual: 'focus' | 'spatial' | 'open';
}

export interface ProductSelection {
  colorId: string;
  attributeId: string;
}

export interface Feature {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  tone: 'cyan' | 'graphite' | 'mist' | 'ember';
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  location: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
