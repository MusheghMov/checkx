import getPageMetadata from "@/lib/getPageMetadata";
import { ExtensionMessage, TweetData } from "@/types";
import { analyzeTweet } from "@/lib/ai/misinformationDetector";
import { MisinformationAnalysis } from "@/types/misinformation";

export default defineContentScript({
  matches: ["*://twitter.com/*", "*://x.com/*"],
  async main() {
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
      // Use a safer encoding method that handles non-Latin1 characters
      return (
        Array.from(textContent)
          .map((char) => char.charCodeAt(0).toString(16))
          .join("")
          .slice(0, 16) || Math.random().toString(36).slice(2, 18)
      );
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

    // Helper function to create custom dropdown
    function createDropdown(analysis: MisinformationAnalysis): HTMLElement {
      const dropdown = document.createElement("div");
      dropdown.className = "checkx-dropdown";
      dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        right: 0;
        width: 280px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        z-index: 1000;
        display: none;
        backdrop-filter: blur(8px);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;

      // Format timestamp
      const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60)
          return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24)
          return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
      };

      // Create confidence bar
      const percentage = Math.min(100, Math.max(0, analysis.confidence));
      const barColor =
        percentage >= 70 ? "#10b981" : percentage >= 40 ? "#f59e0b" : "#ef4444";

      dropdown.innerHTML = `
        <div style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; font-size: 14px; color: #111827;">Analysis Details</div>
        </div>
        
        <div style="padding: 12px;">
          <!-- Confidence -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Confidence</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; font-weight: 500;">${percentage}%</span>
              <div style="flex: 1; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; background: ${barColor}; width: ${percentage}%; transition: width 0.3s ease;"></div>
              </div>
            </div>
          </div>

          ${
            analysis.topics && analysis.topics.length > 0
              ? `
          <!-- Topics -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 6px;">Topics</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${analysis.topics
                .map(
                  (topic) => `
                <span style="display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 4px; font-size: 10px; background: rgba(59, 130, 246, 0.1); color: #1d4ed8;">
                  #${topic}
                </span>
              `,
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }

          <div style="height: 1px; background: #e5e7eb; margin: 8px 0;"></div>

          ${
            analysis.reasoning
              ? `
          <!-- Reasoning -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">AI Reasoning</div>
            <p style="font-size: 11px; color: #374151; line-height: 1.4; max-height: 96px; overflow-y: auto; margin: 0;">
              ${analysis.reasoning}
            </p>
          </div>

          <div style="height: 1px; background: #e5e7eb; margin: 8px 0;"></div>
          `
              : ""
          }

          <!-- Metadata -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #6b7280;">
            <span style="text-transform: capitalize;">${analysis.source} Analysis</span>
            <span>${formatTimestamp(analysis.timestamp)}</span>
          </div>
        </div>
      `;

      return dropdown;
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
        position: relative;
        ${options.isLoading ? "opacity: 0.7;" : ""}
      `;

      // Create and attach dropdown if analysis is available
      if (options.analysis && !badge.querySelector(".checkx-dropdown")) {
        const dropdown = createDropdown(options.analysis);
        badge.appendChild(dropdown);

        // Add click handler to toggle dropdown
        badge.addEventListener("click", (e) => {
          e.stopPropagation();
          const isVisible = dropdown.style.display === "block";

          // Hide all other dropdowns
          document.querySelectorAll(".checkx-dropdown").forEach((d) => {
            (d as HTMLElement).style.display = "none";
          });

          // Toggle current dropdown
          dropdown.style.display = isVisible ? "none" : "block";
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
          if (!badge.contains(e.target as Node)) {
            dropdown.style.display = "none";
          }
        });
      }

      // Add hover effects if not already added
      if (!badge.dataset.hoverAdded) {
        badge.dataset.hoverAdded = "true";
        badge.addEventListener("mouseenter", () => {
          badge.style.transform = "scale(1.05)";
        });

        badge.addEventListener("mouseleave", () => {
          badge.style.transform = "scale(1)";
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

            // Send analysis result to popup for database saving
            try {
              browser.runtime
                .sendMessage({
                  type: "SAVE_TWEET_ANALYSIS",
                  payload: {
                    tweetData: tweetData,
                    analysis: analysis,
                  },
                } as ExtensionMessage)
                .catch((error) => {
                  // Silently handle message sending errors
                  console.log(
                    "CheckX: Could not send analysis to popup:",
                    error,
                  );
                });
            } catch (error) {
              console.log("CheckX: Failed to send message to popup:", error);
            }
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
