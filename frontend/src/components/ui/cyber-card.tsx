import * as React from "react";
import { cn } from "@/lib/utils";

interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "selected" | "disabled" | "glow";
  interactive?: boolean;
}

const CyberCard = React.forwardRef<HTMLDivElement, CyberCardProps>(
  ({ className, variant = "default", interactive = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-card border-border",
      selected: "bg-card border-primary cyber-glow",
      disabled: "bg-muted/50 border-border opacity-50 cursor-not-allowed",
      glow: "bg-card border-primary/50 cyber-glow",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border p-4 transition-all duration-200",
          variants[variant],
          interactive && variant !== "disabled" && "cursor-pointer hover:border-primary/50 hover:bg-card/80 active:scale-[0.98]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CyberCard.displayName = "CyberCard";

const CyberCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-3", className)}
    {...props}
  />
));
CyberCardHeader.displayName = "CyberCardHeader";

const CyberCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-mono text-sm font-semibold tracking-wide text-foreground", className)}
    {...props}
  />
));
CyberCardTitle.displayName = "CyberCardTitle";

const CyberCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm", className)} {...props} />
));
CyberCardContent.displayName = "CyberCardContent";

export { CyberCard, CyberCardHeader, CyberCardTitle, CyberCardContent };
