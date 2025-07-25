import { storage } from "@wxt-dev/storage";
import { TweetData } from "@/types";
import { MisinformationAnalysis } from "@/types/misinformation";

export interface AnalyzedTweet {
  tweetId: string;
  content: string;
  author: string;
  tweetTimestamp: string;
  url: string;
  confidence: number;
  rating: string;
  topics: string[];
  reasoning: string;
  source: string;
  analysisTimestamp: string;
  userId?: string;
}

// Define storage item for analyzed tweets
const analyzedTweetsStorage = storage.defineItem<AnalyzedTweet[]>(
  "local:analyzedTweets",
  {
    fallback: [],
  },
);

/**
 * Save tweet analysis to local storage
 */
export async function saveAnalyzedTweet(
  tweetData: TweetData,
  analysis: MisinformationAnalysis,
  userId?: string,
): Promise<void> {
  try {
    const newTweet: AnalyzedTweet = {
      tweetId: tweetData.id,
      content: tweetData.content,
      author: tweetData.author,
      tweetTimestamp: tweetData.timestamp,
      url: tweetData.url,
      confidence: analysis.confidence,
      rating: analysis.rating,
      topics: analysis.topics,
      reasoning: analysis.reasoning,
      source: analysis.source,
      analysisTimestamp: analysis.timestamp,
      userId: userId,
    };

    // Get existing tweets
    const existingTweets = await analyzedTweetsStorage.getValue();

    // Check if tweet already exists (prevent duplicates)
    const existingIndex = existingTweets.findIndex(
      (tweet) => tweet.tweetId === newTweet.tweetId,
    );

    if (existingIndex >= 0) {
      // Update existing tweet
      existingTweets[existingIndex] = newTweet;
    } else {
      // Add new tweet to the beginning of the array (most recent first)
      existingTweets.unshift(newTweet);
    }

    // Save back to storage
    await analyzedTweetsStorage.setValue(existingTweets);

    console.log("Successfully saved tweet analysis to storage:", tweetData.id);
  } catch (error) {
    console.error("Failed to save tweet analysis to storage:", error);
    throw error;
  }
}

/**
 * Get all analyzed tweets from storage, ordered by most recent first
 */
export async function getAllAnalyzedTweets(): Promise<AnalyzedTweet[]> {
  try {
    const tweets = await analyzedTweetsStorage.getValue();

    // Sort by analysis timestamp, most recent first
    const sortedTweets = tweets.sort(
      (a, b) =>
        new Date(b.analysisTimestamp).getTime() -
        new Date(a.analysisTimestamp).getTime(),
    );

    console.log(
      `Retrieved ${sortedTweets.length} analyzed tweets from storage`,
    );
    return sortedTweets;
  } catch (error) {
    console.error("Failed to retrieve analyzed tweets from storage:", error);
    throw error;
  }
}

/**
 * Get analyzed tweets count
 */
export async function getAnalyzedTweetsCount(): Promise<number> {
  try {
    const tweets = await analyzedTweetsStorage.getValue();
    return tweets.length;
  } catch (error) {
    console.error("Failed to get tweets count from storage:", error);
    return 0;
  }
}

/**
 * Clear all analyzed tweets from storage
 */
export async function clearAnalyzedTweets(): Promise<void> {
  try {
    await analyzedTweetsStorage.setValue([]);
    console.log("Cleared all analyzed tweets from storage");
  } catch (error) {
    console.error("Failed to clear analyzed tweets from storage:", error);
    throw error;
  }
}

/**
 * Get analyzed tweet by ID
 */
export async function getAnalyzedTweetById(
  tweetId: string,
): Promise<AnalyzedTweet | null> {
  try {
    const tweets = await analyzedTweetsStorage.getValue();
    return tweets.find((tweet) => tweet.tweetId === tweetId) || null;
  } catch (error) {
    console.error("Failed to get tweet by ID from storage:", error);
    return null;
  }
}
