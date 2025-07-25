import { Card, CardContent } from "@/components/ui/card";
import Providers from "@/providers";
import Header from "@/components/Header";
import Router from "@/components/Router";

function App() {
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
