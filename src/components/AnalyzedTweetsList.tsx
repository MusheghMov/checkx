import { useQuery } from "@tanstack/react-query";
import { getAllAnalyzedTweets } from "@/lib/storage/service";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, HelpCircle, FilterX } from "lucide-react";
import { useState, useMemo } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TweetRating } from "@/types";
import { extractUniqueTopics, filterTweets } from "@/lib/utils";
import TweetFilters from "./TweetFilters";
import TweetCard from "./TweetCard";

export default function AnalyzedTweetsList() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<TweetRating[]>([]);

  const {
    data: tweets = [],
    error,
    refetch,
  } = useQuery({
    queryKey: ["analyzed-tweets"],
    queryFn: getAllAnalyzedTweets,
    refetchOnWindowFocus: true,
    staleTime: 3000,
  });

  const availableTopics = useMemo(() => extractUniqueTopics(tweets), [tweets]);
  const filteredTweets = useMemo(
    () => filterTweets(tweets, selectedTopics, selectedRatings),
    [tweets, selectedTopics, selectedRatings],
  );

  const handleClearFilters = () => {
    setSelectedTopics([]);
    setSelectedRatings([]);
  };

  const hasActiveFilters =
    selectedTopics.length > 0 || selectedRatings.length > 0;
  const showFilteredEmptyState =
    hasActiveFilters && filteredTweets.length === 0;

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-orange-500" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Failed to Load
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Could not retrieve analyzed tweets
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
        <HelpCircle className="mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No Analysis Yet
        </h3>
        <p className="text-sm text-gray-600">
          Visit Twitter/X to analyze tweets and they'll appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <CardHeader className="p-0">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Analyzed Tweets</span>
          <Badge variant="outline" className="text-xs">
            {tweets.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <TweetFilters
        availableTopics={availableTopics}
        selectedTopics={selectedTopics}
        onTopicsChange={setSelectedTopics}
        selectedRatings={selectedRatings}
        onRatingsChange={setSelectedRatings}
        totalTweets={tweets.length}
        filteredTweets={filteredTweets.length}
        onClearFilters={handleClearFilters}
      />

      {showFilteredEmptyState ? (
        <div className="flex h-48 flex-col items-center justify-center px-4 text-center">
          <FilterX className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No Matching Tweets
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            No tweets match your current filter criteria
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        filteredTweets.map((tweet) => (
          <TweetCard key={tweet.tweetId} tweet={tweet} />
        ))
      )}
    </>
  );
}
