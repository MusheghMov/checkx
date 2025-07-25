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
  return (
    <ThemeProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <Toaster position="top-center" swipeDirections={["right"]} />
        {children}
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}
