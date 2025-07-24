export interface PageMetadata {
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  selectedText?: string;
}

// Remove the old interface - it will be replaced below

export enum StorageKeys {
  SETTINGS = "haibrid_settings",
  PAGE_METADATA = "haibrid_page_data",
  QUERIES_CACHE = "haibrid_queries_cache",
  RECENT_QUERIES = "haibrid_recent_queries",
  AUTH_TOKEN = "haibrid_auth_token",
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

export interface TweetBadgeProps {
  rating: TweetRating;
  className?: string;
  onClick?: () => void;
}

// Extend ExtensionMessage for tweet-related messages
export type ExtensionMessage =
  | { type: "GET_CURRENT_PAGE"; payload?: any }
  | { type: "DETECT_TWEETS"; payload?: any }
  | {
      type: "UPDATE_TWEET_RATING";
      payload: { tweetId: string; rating: TweetRating };
    };
