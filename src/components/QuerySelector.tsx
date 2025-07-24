import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuth } from "@clerk/chrome-extension";
import { useQuery } from "@tanstack/react-query";

interface QuerySelectorProps {
  selectedQueryId?: string;
  onQuerySelect: (queryId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function QuerySelector({
  selectedQueryId,
  onQuerySelect,
  placeholder = "Select a query",
  disabled = false,
}: QuerySelectorProps) {
  const { getToken } = useAuth();

  const { data: queries, isLoading } = useQuery({
    queryKey: ["queries"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/queries?exclude_deleted=true`,
        {
          method: "GET",
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
  });

  if (isLoading) {
    return null;
  }

  return (
    <Select
      value={selectedQueryId}
      onValueChange={onQuerySelect}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="h-[var(radix-select-content-available-height)] max-h-[200px] w-[var(--radix-select-trigger-width)]">
        {queries?.length === 0 ? (
          <SelectItem value="no-queries" disabled>
            No queries available
          </SelectItem>
        ) : (
          queries?.map((query) => (
            <SelectItem key={query.id} value={query.id}>
              <div className="flex flex-col">
                <span className="font-medium">{query.query}</span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
