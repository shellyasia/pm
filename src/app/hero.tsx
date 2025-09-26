import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  backgroundImage?: string;
  overlay?: boolean;
}

interface HeroFeatureProps {
  title: string;
  description: string;
  icon?: ReactNode;
  href?: string;
  className?: string;
}

export function Hero({
  title,
  subtitle,
  description,
  children,
  className,
  backgroundImage,
  overlay = false,
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center",
        backgroundImage && "bg-cover bg-center bg-no-repeat",
        className,
      )}
      style={backgroundImage
        ? { backgroundImage: `url(${backgroundImage})` }
        : undefined}
    >
      {overlay && backgroundImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      <div className="relative z-10 max-w-5xl mx-auto">
        {subtitle && (
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {subtitle}
          </p>
        )}

        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        {description && (
          <p className="mb-8 text-lg text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}

export function HeroFeature({
  title,
  description,
  icon,
  href,
  className,
}: HeroFeatureProps) {
  const Component = href ? "a" : "div";

  return (
    <Component
      href={href}
      className={cn(
        "group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:hover:border-gray-600 dark:hover:bg-gray-800/50",
        href && "cursor-pointer",
        className,
      )}
    >
      <div className="flex items-start space-x-3">
        {icon && (
          <div className="flex-shrink-0 mt-1">
            {icon}
          </div>
        )}

        <div className="flex-1">
          <h3 className="mb-2 text-xl font-semibold">
            {title}
            {href && (
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            )}
          </h3>
          <p className="text-sm opacity-70 max-w-[30ch]">
            {description}
          </p>
        </div>
      </div>
    </Component>
  );
}

export function HeroFeatureGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-6 text-left lg:max-w-5xl lg:w-full lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
