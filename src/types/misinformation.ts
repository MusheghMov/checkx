export interface AISession {
  prompt: (input: string) => Promise<string>;
  promptStreaming: (input: string) => AsyncIterable<string>;
  destroy: () => void;
  clone: () => Promise<AISession>;
  tokensSoFar: number;
  tokensLeft: number;
  maxTokens: number;
}

export interface AISessionOptions {
  systemPrompt?: string;
  temperature?: number;
  topK?: number;
  maxTokens?: number;
}

export interface MisinformationAnalysis {
  confidence: number; // 0-100% probability of misinformation
  rating: "verified" | "questionable" | "false" | "needs_review";
  topics: string[];
  reasoning: string;
  timestamp: string;
  source: "ai" | "rule_based" | "cached";
}

export interface AIAnalysisRequest {
  tweetId: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface AIAnalysisResponse {
  confidence: number;
  topics: string[];
  reasoning: string;
  raw_response?: string;
}

declare global {
  interface Window {
    LanguageModel?: {
      create: (options?: AISessionOptions) => Promise<AISession>;
    };
  }

  const LanguageModel: {
    create: (options?: AISessionOptions) => Promise<AISession>;
  };
}

export type TweetRatingWithConfidence = {
  rating: "verified" | "questionable" | "false" | "needs_review";
  confidence: number;
  isLoading?: boolean;
  error?: string;
};
