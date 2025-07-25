import { CardHeader, CardTitle } from "./ui/card";
import { Link } from "wouter";

export default function Header() {
  return (
    <CardHeader className="flex flex-row items-center justify-between px-0">
      <Link to="/" className="cursor-pointer">
        <CardTitle className="text-lg font-bold">CheckX</CardTitle>
      </Link>

      <ModeToggle />
    </CardHeader>
  );
}
