import { Button } from "./ui/button";
import { CardFooter } from "./ui/card";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="flex w-full flex-col gap-4">
        <LinkPreview />
      </div>

      <CardFooter className="flex w-full gap-2 px-0">
        <Button
          variant="outline"
          onClick={() => window.close()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button className="flex-1">Save Link</Button>
      </CardFooter>
    </div>
  );
}
