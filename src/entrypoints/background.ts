import { ExtensionMessage } from "@/types";
import { saveAnalyzedTweet } from "@/lib/storage/service";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    async (message: ExtensionMessage, sender, sendResponse) => {
      console.log("Received message from content script:", message);
      try {
        switch (message.type) {
          case "SAVE_TWEET_ANALYSIS":
            try {
              await saveAnalyzedTweet(
                message.payload.tweetData,
                message.payload.analysis,
                message.payload.userId,
              );
              sendResponse({ success: true });
            } catch (error) {
              console.error("Failed to save tweet analysis:", error);
              sendResponse({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }
            break;

          default:
            sendResponse({ success: false, error: "Unknown message type" });
        }
      } catch (error) {
        console.error("Error handling message:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );
});
