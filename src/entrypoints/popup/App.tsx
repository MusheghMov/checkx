import { Card, CardContent } from "@/components/ui/card";
import Providers from "@/providers";
import Header from "@/components/Header";
import Router from "@/components/Router";

function App() {
  return (
    <Providers>
      <Card className="m-1 flex h-[500px] w-[350px] flex-col gap-4 rounded-none border-dashed px-2 py-2 shadow-lg">
        <Header />

        <CardContent className="flex-1 px-0">
          <Router />
        </CardContent>
      </Card>
    </Providers>
  );
}

export default App;
