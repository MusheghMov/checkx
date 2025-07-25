import { MisinformationAnalysis } from "./misinformation";

export interface PageMetadata {
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  selectedText?: string;
}

// Tweet-related types
export enum TweetRating {
  VERIFIED = "verified",
  QUESTIONABLE = "questionable",
  FALSE = "false",
  NEEDS_REVIEW = "needs_review",
}

export interface TweetData {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  url: string;
}

// Extend ExtensionMessage for tweet-related messages
export type ExtensionMessage =
  | { type: "GET_CURRENT_PAGE"; payload?: any }
  | { type: "DETECT_TWEETS"; payload?: any }
  | {
      type: "UPDATE_TWEET_RATING";
      payload: { tweetId: string; rating: TweetRating };
    }
  | {
      type: "SAVE_TWEET_ANALYSIS";
      payload: {
        tweetData: TweetData;
        analysis: MisinformationAnalysis;
        userId?: string;
      };
    };

// Re-export AI-related types from misinformation module
export type {
  AISession,
  AISessionOptions,
  MisinformationAnalysis,
  AIAnalysisRequest,
  AIAnalysisResponse,
  TweetRatingWithConfidence,
} from "./misinformation";
