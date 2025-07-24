import { PageMetadata } from "@/types";

export default function getPageMetadata(): PageMetadata {
  const getMetaContent = (name: string): string | undefined => {
    const meta = document.querySelector(
      `meta[name="${name}"], meta[property="${name}"]`,
    );
    return meta?.getAttribute("content") || undefined;
  };

  const getFaviconUrl = (): string | undefined => {
    const favicon = document.querySelector(
      'link[rel*="icon"]',
    ) as HTMLLinkElement;
    if (favicon?.href) {
      return favicon.href;
    }
    return `${window.location.origin}/favicon.ico`;
  };

  const selectedText = window.getSelection()?.toString().trim() || undefined;

  return {
    url: window.location.href,
    title: document.title || "Untitled",
    description:
      getMetaContent("description") || getMetaContent("og:description"),
    favicon: getFaviconUrl(),
    selectedText,
  };
}
