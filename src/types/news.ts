/**
 * Simplified news-related type definitions for NewsData.io integration
 */

// Simple NewsData.io API response (only what we need)
export interface NewsDataArticle {
  title: string;
  link: string;
  description: string;
  source_id: string;
  pubDate: string;
}

export interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
}

// Simplified news result for our analysis
export interface NewsResult {
  title: string;
  source: string;
  relevanceScore: number;
}

// News verification results
export interface NewsVerificationResult {
  articles: NewsResult[];
  verificationStatus: "verified" | "contradicted" | "no_coverage" | "mixed";
  summary: string;
  confidenceScore: number;
}

