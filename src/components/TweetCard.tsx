import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  HelpCircle,
  XCircle,
} from "lucide-react";
import Markdown from "react-markdown";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { AnalyzedTweet } from "@/lib/storage/service";

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

export default function TweetCard({ tweet }: { tweet: AnalyzedTweet }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxContentLength = 120;
  const shouldTruncate = tweet.content.length > maxContentLength;
  const displayContent =
    shouldTruncate && !isExpanded
      ? tweet.content.slice(0, maxContentLength) + "..."
      : tweet.content;

  return (
    <Card className="p-0 transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <Accordion type="single" collapsible className="overflow-hidden">
          <AccordionItem value="item-1" className="flex flex-col gap-2">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
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
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 cursor-pointer p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(tweet.url, "_blank", "noopener,noreferrer");
                }}
                title="View original tweet"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
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
            </AccordionTrigger>
            <AccordionContent className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              <article className="prose lg:prose-xl dark:prose-invert">
                <Markdown>{tweet.reasoning}</Markdown>
              </article>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
