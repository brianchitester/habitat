import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
        Habitat
      </h1>
      <p className="mt-3 text-muted-foreground text-lg">
        Build better habits, one day at a time.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/dashboard">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/auth">
          <Button variant="outline" size="lg">
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
