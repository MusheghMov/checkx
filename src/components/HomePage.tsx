import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { CardFooter } from "./ui/card";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/chrome-extension";
import { toast } from "sonner";

function isValidUrlUrlAPI(url_string: string) {
  try {
    new URL(url_string);
    return true;
  } catch (e) {
    return false;
  }
}

export default function HomePage() {
  const [selectedQueryId, setSelectedQueryId] = useState<string>("");
  const { getToken } = useAuth();
  const { mutate: saveLinkMutation, isPending } = useMutation({
    mutationKey: ["saveLink"],
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        return;
      }
      const [activeTab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!activeTab.url) return;
      const isValidUrl = isValidUrlUrlAPI(activeTab?.url);
      if (!isValidUrl) return;
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/queries/${selectedQueryId}/sources/attach/`,
        {
          body: JSON.stringify({
            url: activeTab.url,
          }),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        return data?.results as any[];
      }
    },
    onSuccess: () => {
      toast.success("Link saved successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="flex w-full flex-col gap-4">
        <LinkPreview />

        <QuerySelector
          selectedQueryId={selectedQueryId}
          onQuerySelect={setSelectedQueryId}
          placeholder="Choose a query to save to"
        />
      </div>

      <CardFooter className="flex w-full gap-2 px-0">
        <Button
          variant="outline"
          onClick={() => window.close()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            saveLinkMutation();
          }}
          // disabled={isPending || !selectedQueryId}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Link"
          )}
        </Button>
      </CardFooter>
    </div>
  );
}
