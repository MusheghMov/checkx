import getPageMetadata from "@/lib/getPageMetadata";
import { ExtensionMessage, TweetData } from "@/types";
import { analyzeTweet } from "@/lib/ai/misinformationDetector";
import { MisinformationAnalysis } from "@/types/misinformation";

export default defineContentScript({
  matches: ["*://twitter.com/*", "*://x.com/*"],
  async main() {
    console.log("CheckX: Content script loaded");

    // Store for detected tweets to avoid duplicate processing
    const processedTweets = new Set<string>();

    // Tweet detection and processing logic
    function detectTweets() {
      const tweetElements = document.querySelectorAll(
        'article[data-testid="tweet"]',
      );

      tweetElements.forEach((tweetElement) => {
        const tweetId = extractTweetId(tweetElement);
        if (!tweetId || processedTweets.has(tweetId)) {
          return;
        }

        processedTweets.add(tweetId);
        const tweetData = extractTweetData(tweetElement, tweetId);

        if (tweetData) {
          console.log("CheckX: Tweet detected", tweetData);
          // Start badge injection and AI analysis (no need to await)
          injectBadge(tweetElement, tweetData).catch((error) => {
            console.error(
              "CheckX: Failed to inject badge for tweet",
              tweetData.id,
              error,
            );
          });
        }
      });
    }

    // Extract tweet ID from tweet element
    function extractTweetId(tweetElement: Element): string | null {
      // Try to get tweet ID from various possible locations
      const timeElement = tweetElement.querySelector("time");
      const parentLink = timeElement?.closest("a");

      if (parentLink?.href) {
        const match = parentLink.href.match(/\/status\/(\d+)/);
        return match ? match[1] : null;
      }

      // Fallback: generate ID from element position and content
      const textContent = tweetElement.textContent?.slice(0, 50) || "";
      console.log("TEXT CONTENT", textContent);
      return btoa(textContent).slice(0, 16);
    }

    // Extract tweet data from DOM element
    function extractTweetData(
      tweetElement: Element,
      tweetId: string,
    ): TweetData | null {
      try {
        // Extract author info
        const authorElement = tweetElement.querySelector(
          '[data-testid="User-Name"]',
        );
        const author = authorElement?.textContent?.trim() || "Unknown User";

        // Extract tweet content
        const tweetTextElement = tweetElement.querySelector(
          '[data-testid="tweetText"]',
        );
        const content = tweetTextElement?.textContent?.trim() || "";

        // Extract timestamp
        const timeElement = tweetElement.querySelector("time");
        const timestamp =
          timeElement?.getAttribute("datetime") || new Date().toISOString();

        // Extract URL
        const linkElement = tweetElement.querySelector(
          'a[href*="/status/"]',
        ) as HTMLAnchorElement;
        const url = linkElement?.href || `https://x.com/tweet/${tweetId}`;

        return {
          id: tweetId,
          content,
          author,
          timestamp,
          url,
        };
      } catch (error) {
        console.error("CheckX: Error extracting tweet data", error);
        return null;
      }
    }

    // AI-powered misinformation analysis
    async function analyzetweet(
      tweetData: TweetData,
    ): Promise<MisinformationAnalysis> {
      try {
        console.log("CheckX: Starting AI analysis for tweet", tweetData.id);
        const analysis = await analyzeTweet(tweetData);
        console.log("CheckX: AI analysis completed", {
          tweetId: tweetData.id,
          rating: analysis.rating,
          confidence: analysis.confidence,
          source: analysis.source,
        });
        return analysis;
      } catch (error) {
        console.error("CheckX: Analysis failed for tweet", tweetData.id, error);

        // Fallback analysis
        return {
          confidence: 25,
          rating: "needs_review",
          topics: [],
          reasoning: "Analysis failed - please review manually",
          timestamp: new Date().toISOString(),
          source: "rule_based",
        };
      }
    }

    // Helper function to get badge text based on analysis
    function getBadgeText(analysis: MisinformationAnalysis): string {
      const ratingLabels = {
        verified: "✓ Verified",
        questionable: "⚠ Questionable",
        false: "✗ False",
        needs_review: "? Needs Review",
      };

      const baseText = ratingLabels[analysis.rating] || "? Unknown";

      // Add confidence percentage for AI analysis
      if (analysis.source === "ai" && analysis.confidence > 0) {
        return `${baseText} (${analysis.confidence}%)`;
      }

      return baseText;
    }

    // Helper function to update badge appearance
    function updateBadgeContent(
      badge: HTMLElement,
      options: {
        rating: string;
        text: string;
        confidence: number;
        isLoading: boolean;
        analysis?: MisinformationAnalysis;
      },
    ) {
      const badgeStyles = {
        verified:
          "background: rgba(34, 197, 94, 0.1); color: rgb(22, 163, 74); border: 1px solid rgba(34, 197, 94, 0.2);",
        questionable:
          "background: rgba(245, 158, 11, 0.1); color: rgb(217, 119, 6); border: 1px solid rgba(245, 158, 11, 0.2);",
        false:
          "background: rgba(239, 68, 68, 0.1); color: rgb(220, 38, 38); border: 1px solid rgba(239, 68, 68, 0.2);",
        needs_review:
          "background: rgba(107, 114, 128, 0.1); color: rgb(75, 85, 99); border: 1px solid rgba(107, 114, 128, 0.2);",
      };

      badge.textContent = options.text;
      badge.style.cssText = `
        ${badgeStyles[options.rating as keyof typeof badgeStyles]}
        padding: 4px 8px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        backdrop-filter: blur(8px);
        cursor: pointer;
        transition: all 0.2s ease;
        ${options.isLoading ? "opacity: 0.7;" : ""}
      `;

      // Update title tooltip with analysis details
      if (options.analysis) {
        const tooltip = `Rating: ${options.analysis.rating}\nConfidence: ${options.analysis.confidence}%\nSource: ${options.analysis.source}\nReasoning: ${options.analysis.reasoning}`;
        badge.title = tooltip;
      }

      // Add hover effects if not already added
      if (badge.onmouseenter === null) {
        badge.addEventListener("mouseenter", () => {
          badge.style.transform = "scale(1.05)";
        });

        badge.addEventListener("mouseleave", () => {
          badge.style.transform = "scale(1)";
        });

        // Add click handler with analysis data
        badge.addEventListener("click", (e) => {
          e.stopPropagation();
          console.log("CheckX: Badge clicked", {
            tweetId: badge.dataset.tweetId,
            analysis: options.analysis,
          });
        });
      }
    }

    // Inject badge into tweet element with AI analysis
    async function injectBadge(tweetElement: Element, tweetData: TweetData) {
      try {
        // Create badge container
        const badgeContainer = document.createElement("div");
        badgeContainer.className = "checkx-badge-container";
        badgeContainer.style.cssText = `
          position: absolute;
          top: 8px;
          right: 70px;
          z-index: 10;
          pointer-events: auto;
        `;

        // Create badge element
        const badge = document.createElement("div");
        badge.dataset.tweetId = tweetData.id; // Store tweet ID for click handler

        // Show loading state initially
        updateBadgeContent(badge, {
          rating: "needs_review",
          text: "🔄 Analyzing...",
          confidence: 0,
          isLoading: true,
        });

        badgeContainer.appendChild(badge);

        // Make sure the parent has relative positioning and insert badge
        const tweetContainer =
          tweetElement.querySelector('[data-testid="cellInnerDiv"]') ||
          tweetElement;
        if (tweetContainer instanceof HTMLElement) {
          tweetContainer.style.position = "relative";
          tweetContainer.appendChild(badgeContainer);
        }

        // Start AI analysis in background
        analyzetweet(tweetData)
          .then((analysis) => {
            updateBadgeContent(badge, {
              rating: analysis.rating,
              text: getBadgeText(analysis),
              confidence: analysis.confidence,
              isLoading: false,
              analysis: analysis,
            });
          })
          .catch((error) => {
            console.error(
              "CheckX: Failed to update badge after analysis",
              error,
            );
            updateBadgeContent(badge, {
              rating: "needs_review",
              text: "⚠ Error",
              confidence: 0,
              isLoading: false,
            });
          });
      } catch (error) {
        console.error("CheckX: Error injecting badge", error);
      }
    }

    // Set up MutationObserver to watch for new tweets
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if any added nodes contain tweets
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (
                element.querySelector?.('article[data-testid="tweet"]') ||
                element.matches?.('article[data-testid="tweet"]')
              ) {
                shouldCheck = true;
              }
            }
          });
        }
      });

      if (shouldCheck) {
        // Debounce the tweet detection
        setTimeout(detectTweets, 100);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial tweet detection
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", detectTweets);
    } else {
      detectTweets();
    }

    // Also detect tweets when page becomes visible (tab switching, etc.)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        setTimeout(detectTweets, 500);
      }
    });

    // Handle extension messages
    browser.runtime.onMessage.addListener(
      async (message: ExtensionMessage, _sender, sendResponse) => {
        switch (message.type) {
          case "GET_CURRENT_PAGE":
            const pageMetadata = getPageMetadata();
            sendResponse({ success: true, data: pageMetadata });
            break;

          case "DETECT_TWEETS":
            detectTweets();
            sendResponse({
              success: true,
              message: "Tweet detection triggered",
            });
            break;

          default:
            sendResponse({ success: false, error: "Unknown message type" });
        }
      },
    );

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      observer.disconnect();
    });
  },
});
