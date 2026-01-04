import { useState, useEffect } from 'react';
import quotesData from '@/data/psychology-quotes.json';

export interface Quote {
  id: number;
  quote: string;
  author: string;
  category: string;
}

/**
 * Hook to get a random psychology quote
 * Returns a new random quote on each page load
 */
export const useRandomQuote = () => {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Get a random quote on mount
    const quotes = quotesData.psychology_quotes;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  return quote;
};

/**
 * Get a random quote synchronously (useful for components that don't need state)
 */
export const getRandomQuote = (): Quote => {
  const quotes = quotesData.psychology_quotes;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

