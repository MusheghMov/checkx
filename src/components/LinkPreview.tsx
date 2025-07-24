import { Card, CardContent } from "@/components/ui/card";
import { PageMetadata } from "@/types";
import { useQuery } from "@tanstack/react-query";
import getPageMetadata from "@/lib/getPageMetadata";

export function LinkPreview() {
  const { data: pageData } = useQuery({
    queryKey: ["active-tab"],
    queryFn: async () => {
      const [activeTab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!activeTab?.id) {
        return null;
      }

      const [result] = await browser.scripting.executeScript({
        target: { tabId: activeTab?.id },
        func: getPageMetadata,
      });

      return {
        url: activeTab.url,
        title: activeTab.title,
        favicon: activeTab.favIconUrl,
        selectedText: result?.result?.selectedText || "",
      } as PageMetadata;
    },
    staleTime: 0,
  });

  if (!pageData) return null;

  return (
    <Card className="border-dashed py-4 shadow-none">
      <CardContent className="py-0">
        <div className="flex items-start gap-3">
          {pageData.favicon && (
            <img
              src={pageData.favicon}
              alt="Favicon"
              className="h-8 w-8 flex-shrink-0 overflow-hidden rounded border border-dashed"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="line-clamp-2 text-sm leading-tight font-medium">
              {pageData.title}
            </h3>
            <p className="text-muted-foreground text-xs leading-tight">
              {getDomain(pageData.url)}
            </p>
            {pageData.selectedText && (
              <div className="bg-muted rounded-sm p-2">
                <p className="text-muted-foreground text-xs font-medium">
                  Selected text:
                </p>
                <p className="line-clamp-3 text-xs leading-tight">
                  {pageData.selectedText}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};
