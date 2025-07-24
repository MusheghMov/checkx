import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TweetRating } from "@/types";

const tweetBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm border backdrop-blur-sm",
  {
    variants: {
      rating: {
        [TweetRating.VERIFIED]:
          "bg-green-50/90 text-green-800 border-green-200 hover:bg-green-100/90 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
        [TweetRating.QUESTIONABLE]:
          "bg-yellow-50/90 text-yellow-800 border-yellow-200 hover:bg-yellow-100/90 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
        [TweetRating.FALSE]:
          "bg-red-50/90 text-red-800 border-red-200 hover:bg-red-100/90 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
        [TweetRating.NEEDS_REVIEW]:
          "bg-gray-50/90 text-gray-700 border-gray-200 hover:bg-gray-100/90 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
      },
      size: {
        sm: "text-xs px-1.5 py-0.5",
        default: "text-xs px-2 py-1",
        lg: "text-sm px-3 py-1.5",
      },
    },
    defaultVariants: {
      rating: TweetRating.NEEDS_REVIEW,
      size: "default",
    },
  },
);

// Rating display mapping
const ratingLabels = {
  [TweetRating.VERIFIED]: "✓ Verified",
  [TweetRating.QUESTIONABLE]: "⚠ Questionable",
  [TweetRating.FALSE]: "✗ False",
  [TweetRating.NEEDS_REVIEW]: "? Needs Review",
};

// Rating icons mapping
const ratingIcons = {
  [TweetRating.VERIFIED]: "✓",
  [TweetRating.QUESTIONABLE]: "⚠",
  [TweetRating.FALSE]: "✗",
  [TweetRating.NEEDS_REVIEW]: "?",
};

interface TweetBadgeVariantProps {
  rating: TweetRating;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  showIcon?: boolean;
}

export interface TweetBadgeComponentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    TweetBadgeVariantProps {
  className?: string;
  onClick?: () => void;
}

const TweetBadge = React.forwardRef<HTMLDivElement, TweetBadgeComponentProps>(
  (
    {
      className,
      rating,
      size,
      showLabel = true,
      showIcon = true,
      onClick,
      ...props
    },
    ref,
  ) => {
    const badgeContent = (
      <>
        {showIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {ratingIcons[rating]}
          </span>
        )}
        {showLabel && (
          <span className="truncate">
            {showIcon
              ? ratingLabels[rating].split(" ").slice(1).join(" ")
              : ratingLabels[rating]}
          </span>
        )}
      </>
    );

    if (onClick) {
      return (
        <button
          className={cn(
            tweetBadgeVariants({ rating: rating as any, size }),
            "cursor-pointer hover:scale-105 focus:ring-2 focus:ring-current focus:ring-offset-1 focus:outline-none",
            className,
          )}
          onClick={onClick}
          type="button"
          aria-label={`Tweet rating: ${ratingLabels[rating]}`}
        >
          {badgeContent}
        </button>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          tweetBadgeVariants({ rating: rating as any, size }),
          className,
        )}
        role="status"
        aria-label={`Tweet rating: ${ratingLabels[rating]}`}
        {...props}
      >
        {badgeContent}
      </div>
    );
  },
);

TweetBadge.displayName = "TweetBadge";

export { TweetBadge, tweetBadgeVariants, ratingLabels, ratingIcons };
