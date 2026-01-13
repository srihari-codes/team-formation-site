import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "online" | "pending" | "locked" | "success" | "error";
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusStyles = {
    online: "bg-success",
    pending: "bg-warning animate-pulse",
    locked: "bg-muted-foreground",
    success: "bg-success",
    error: "bg-destructive",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-2 h-2 rounded-full", statusStyles[status])} />
      {label && (
        <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
