import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnalyzedTweet } from "@/lib/storage/service";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract unique topics from an array of analyzed tweets
 * @param tweets - Array of analyzed tweets
 * @returns Array of unique topics sorted alphabetically
 */
export function extractUniqueTopics(tweets: AnalyzedTweet[]): string[] {
  const topicsSet = new Set<string>();

  tweets.forEach((tweet) => {
    if (tweet.topics && Array.isArray(tweet.topics)) {
      tweet.topics.forEach((topic) => {
        if (topic && typeof topic === "string" && topic.trim()) {
          topicsSet.add(topic.trim().toLowerCase());
        }
      });
    }
  });

  return Array.from(topicsSet).sort();
}

/**
 * Filter tweets based on selected topics and ratings
 * @param tweets - Array of analyzed tweets
 * @param selectedTopics - Array of selected topic filters
 * @param selectedRatings - Array of selected rating filters
 * @returns Filtered array of tweets
 */
export function filterTweets(
  tweets: AnalyzedTweet[],
  selectedTopics: string[],
  selectedRatings: string[],
): AnalyzedTweet[] {
  return tweets.filter((tweet) => {
    // Check topic filter
    const topicMatch =
      selectedTopics.length === 0 ||
      (tweet.topics &&
        tweet.topics.some((topic) =>
          selectedTopics.includes(topic.toLowerCase()),
        ));

    const ratingMatch =
      selectedRatings.length === 0 || selectedRatings.includes(tweet.rating);

    return topicMatch && ratingMatch;
  });
}
