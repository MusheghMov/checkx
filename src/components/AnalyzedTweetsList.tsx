import { useQuery } from "@tanstack/react-query";
import { getAllAnalyzedTweets, AnalyzedTweet } from "@/lib/storage/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Markdown from "react-markdown";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { Button } from "./ui/button";

const getRatingIcon = (rating: string) => {
  switch (rating) {
    case "verified":
      return <CheckCircle className="h-3 w-3" />;
    case "questionable":
      return <AlertCircle className="h-3 w-3" />;
    case "false":
      return <XCircle className="h-3 w-3" />;
    case "needs_review":
    default:
      return <HelpCircle className="h-3 w-3" />;
  }
};

const getRatingColor = (rating: string) => {
  switch (rating) {
    case "verified":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "questionable":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "false":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "needs_review":
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getRatingLabel = (rating: string) => {
  switch (rating) {
    case "verified":
      return "Verified";
    case "questionable":
      return "Questionable";
    case "false":
      return "False";
    case "needs_review":
    default:
      return "Needs Review";
  }
};

const formatTimestamp = (timestamp: Date) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

interface TweetCardProps {
  tweet: AnalyzedTweet;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxContentLength = 120;
  const shouldTruncate = tweet.content.length > maxContentLength;
  const displayContent =
    shouldTruncate && !isExpanded
      ? tweet.content.slice(0, maxContentLength) + "..."
      : tweet.content;

  return (
    <Card className="cursor-pointer p-0 transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <Accordion type="single" collapsible className="overflow-hidden">
          <AccordionItem value="item-1">
            <div className="flex w-full items-center justify-end">
              <Badge
                variant="secondary"
                className={`${getRatingColor(tweet.rating)} flex items-center gap-1 text-xs`}
              >
                {getRatingIcon(tweet.rating)}
                {getRatingLabel(tweet.rating)}
              </Badge>
              <span className="ml-2 flex-shrink-0 text-xs text-gray-500">
                {formatTimestamp(new Date(tweet.analysisTimestamp))}
              </span>
            </div>

            <span className="line-clamp-1 text-start text-sm font-medium">
              @{tweet.author}
            </span>

            <div className="mb-2 text-start text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {displayContent}
              {shouldTruncate && (
                <button
                  className="ml-1 text-xs text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            <div className="flex flex-col items-start justify-between gap-2 text-xs text-gray-500 dark:text-gray-300">
              <div className="flex items-center gap-3">
                <span>Confidence: {tweet.confidence}%</span>
                <span className="capitalize">{tweet.source}</span>
              </div>
              {tweet.topics && tweet.topics.length > 0 && (
                <div className="flex items-center gap-1">
                  {tweet.topics.slice(0, 2).map((topic, index) => (
                    <span
                      key={index}
                      className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700"
                    >
                      #{topic}
                    </span>
                  ))}
                  {tweet.topics.length > 2 && (
                    <span className="text-gray-400">
                      +{tweet.topics.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
            <AccordionTrigger className="mt-4 flex w-full items-center justify-between gap-2 overflow-hidden">
              <div className="mb-1 font-medium">Analysis Reasoning:</div>
              <Button variant="outline" className="h-min w-min !p-0">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </AccordionTrigger>
            <AccordionContent className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              <Markdown>{tweet.reasoning}</Markdown>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="mb-3">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="mb-2 h-16 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function AnalyzedTweetsList() {
  const {
    data: tweets = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["analyzed-tweets"],
    queryFn: getAllAnalyzedTweets,
    refetchOnWindowFocus: true,
    staleTime: 3000,
  });

  if (isLoading) {
    return (
      <div>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Analyzed Tweets</span>
            <Skeleton className="h-5 w-8" />
          </CardTitle>
        </CardHeader>
        <LoadingSkeleton />
      </div>
    );
  }

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

      {tweets.map((tweet) => (
        <TweetCard key={tweet.tweetId} tweet={tweet} />
      ))}
    </>
  );
}
