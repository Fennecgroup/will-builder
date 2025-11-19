import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/animated-background";

export function Hero() {
  return (
    <section className="relative flex min-h-[100vh] w-full items-start justify-center overflow-hidden">
      {/* Interactive Animated Background */}
      <div
        className="interactive-background absolute inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5"
        aria-hidden="true"
      >
        <AnimatedBackground />
      </div>

      {/* Left Decorative Logo */}
      <div
        className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:block xl:left-16"
        aria-hidden="true"
      >
        <Image
          src="/logo.svg"
          alt=""
          width={256}
          height={256}
          className="h-48 w-48 opacity-50 xl:h-64 xl:w-64"
        />
      </div>

      {/* Right Decorative Logo - Flipped */}
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block xl:right-16"
        aria-hidden="true"
      >
        <Image
          src="/logo.svg"
          alt=""
          width={256}
          height={256}
          className="h-48 w-48 scale-x-[-1] opacity-50 xl:h-64 xl:w-64"
        />
      </div>

      {/* Hero Content */}
      <div className="container flex flex-col items-center px-4 pt-24 md:pt-32 lg:pt-40">
        <div className="flex max-w-4xl flex-col items-center gap-8 text-center">
          {/* Headline */}
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Fennec Will Builder
            </h1>
            <p className="text-xl text-muted-foreground sm:text-2xl md:text-3xl font-light">
              AI-Powered Estate Planning
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="text-base" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Optional supporting text */}
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Create a legally sound will in minutes with the power of artificial
            intelligence. Secure your legacy and protect your loved ones.
          </p>
        </div>
      </div>
    </section>
  );
}
