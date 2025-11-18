import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Fennec Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-semibold text-lg hidden sm:inline-block">
              Fennec
            </span>
          </Link>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            About
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
