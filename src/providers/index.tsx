import { ClerkProvider } from "@clerk/chrome-extension";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

// Create a browser extension storage persister
const createExtensionStoragePersister = () => {
  return {
    persistClient: async (client: any) => {
      await browser.storage.local.set({ "tanstack-query-cache": client });
    },
    restoreClient: async () => {
      const result = await browser.storage.local.get("tanstack-query-cache");
      return result["tanstack-query-cache"] || undefined;
    },
    removeClient: async () => {
      await browser.storage.local.remove("tanstack-query-cache");
    },
  };
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const persister = createExtensionStoragePersister();

export default function Providers({ children }: { children: React.ReactNode }) {
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const SYNC_HOST = import.meta.env.VITE_CLERK_SYNC_HOST;

  return (
    <ThemeProvider>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        syncHost={SYNC_HOST}
        signInFallbackRedirectUrl={`${browser.runtime.getURL("/")}popup.html`}
        afterSignOutUrl={`${browser.runtime.getURL("/")}popup.html`}
      >
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister }}
        >
          <Toaster position="top-center" swipeDirections={["right"]} />
          {children}
        </PersistQueryClientProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
