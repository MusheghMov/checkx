import { Card, CardContent } from "@/components/ui/card";
import Providers from "@/providers";
import Header from "@/components/Header";
import Router from "@/components/Router";
import { useEffect } from "react";
import { saveAnalyzedTweet } from "@/lib/storage/service";
import { ExtensionMessage } from "@/types";

function App() {
  useEffect(() => {
    // Set up message listener for saving analysis data
    const messageListener = async (
      message: ExtensionMessage,
      _sender: Browser.runtime.MessageSender,
      sendResponse: (response?: any) => void,
    ) => {
      console.log("CheckX: Message received", message);
      if (message.type === "SAVE_TWEET_ANALYSIS") {
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
      }
    };

    // Add message listener
    browser.runtime.onMessage.addListener(messageListener);

    // Cleanup on unmount
    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <Providers>
      <Card className="relative flex h-[600px] w-[800px] flex-col gap-4 overflow-hidden rounded-none border-dashed px-2 py-2 shadow-lg">
        <Header />

        <CardContent className="flex flex-1 flex-col gap-4 overflow-auto px-0">
          <Router />
        </CardContent>
      </Card>
    </Providers>
  );
}

export default App;
