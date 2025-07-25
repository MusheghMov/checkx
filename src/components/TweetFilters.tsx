"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TweetRating } from "@/types";

interface TweetFiltersProps {
  availableTopics: string[];
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
  selectedRatings: TweetRating[];
  onRatingsChange: (ratings: TweetRating[]) => void;
  totalTweets: number;
  filteredTweets: number;
  onClearFilters: () => void;
}

const RATING_LABELS: Record<TweetRating, string> = {
  [TweetRating.VERIFIED]: "Verified",
  [TweetRating.QUESTIONABLE]: "Questionable",
  [TweetRating.FALSE]: "False",
  [TweetRating.NEEDS_REVIEW]: "Needs Review",
};

const RATING_COLORS: Record<TweetRating, string> = {
  [TweetRating.VERIFIED]:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [TweetRating.QUESTIONABLE]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  [TweetRating.FALSE]:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  [TweetRating.NEEDS_REVIEW]:
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function TweetFilters({
  availableTopics,
  selectedTopics,
  onTopicsChange,
  selectedRatings,
  onRatingsChange,
  totalTweets,
  filteredTweets,
  onClearFilters,
}: TweetFiltersProps) {
  const [topicPopoverOpen, setTopicPopoverOpen] = useState(false);
  const hasActiveFilters =
    selectedTopics.length > 0 || selectedRatings.length > 0;

  const handleTopicSelect = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      onTopicsChange(selectedTopics.filter((t) => t !== topic));
    } else {
      onTopicsChange([...selectedTopics, topic]);
    }
  };

  const handleRatingToggle = (rating: TweetRating, checked: boolean) => {
    if (checked) {
      onRatingsChange([...selectedRatings, rating]);
    } else {
      onRatingsChange(selectedRatings.filter((r) => r !== rating));
    }
  };

  const removeTopicFilter = (topicToRemove: string) => {
    onTopicsChange(selectedTopics.filter((topic) => topic !== topicToRemove));
  };

  const removeRatingFilter = (ratingToRemove: TweetRating) => {
    onRatingsChange(
      selectedRatings.filter((rating) => rating !== ratingToRemove),
    );
  };

  return (
    <div className="space-y-4 border-b pb-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Topic Filter */}
        <Popover open={topicPopoverOpen} onOpenChange={setTopicPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={topicPopoverOpen}
              className="min-w-[200px] justify-between"
            >
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Topics{" "}
                {selectedTopics.length > 0 && `(${selectedTopics.length})`}
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="min-w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search topics..." />
              <CommandList>
                <CommandEmpty>No topics found.</CommandEmpty>
                <CommandGroup>
                  {availableTopics.map((topic) => (
                    <CommandItem
                      key={topic}
                      value={topic}
                      onSelect={() => handleTopicSelect(topic)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedTopics.includes(topic)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      #{topic}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Truthfulness Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[160px] justify-between">
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Truthfulness{" "}
                {selectedRatings.length > 0 && `(${selectedRatings.length})`}
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter by Rating</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.values(TweetRating).map((rating) => (
              <DropdownMenuCheckboxItem
                key={rating}
                checked={selectedRatings.includes(rating)}
                onCheckedChange={(checked) =>
                  handleRatingToggle(rating, checked)
                }
              >
                <span
                  className={cn(
                    "mr-2 inline-block h-2 w-2 rounded-full",
                    RATING_COLORS[rating],
                  )}
                />
                {RATING_LABELS[rating]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}

        {/* Results Counter */}
        <div className="text-muted-foreground ml-auto text-sm">
          {filteredTweets} of {totalTweets} tweets
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedTopics.map((topic) => (
            <Badge
              key={topic}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              #{topic}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTopicFilter(topic)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {topic} filter</span>
              </Button>
            </Badge>
          ))}
          {selectedRatings.map((rating) => (
            <Badge
              key={rating}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  RATING_COLORS[rating],
                )}
              />
              {RATING_LABELS[rating]}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeRatingFilter(rating)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">
                  Remove {RATING_LABELS[rating]} filter
                </span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

