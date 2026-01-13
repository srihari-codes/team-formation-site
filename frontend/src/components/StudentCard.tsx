import { CyberCard, CyberCardContent } from "@/components/ui/cyber-card";
import { Check, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentCardProps {
  rollNo: string;
  name: string;
  selectable: boolean;
  isSelected: boolean;
  onToggle: (rollNo: string) => void;
  disabled?: boolean;
}

export function StudentCard({ rollNo, name, selectable, isSelected, onToggle, disabled }: StudentCardProps) {
  const canInteract = selectable && !disabled;
  
  const variant = isSelected 
    ? "selected" 
    : !selectable || disabled 
      ? "disabled" 
      : "default";

  return (
    <CyberCard
      variant={variant}
      interactive={canInteract}
      onClick={() => canInteract && onToggle(rollNo)}
      className="relative"
    >
      <CyberCardContent className="flex items-center gap-3">
        <div 
          className={cn(
            "w-10 h-10 rounded-md flex items-center justify-center border transition-colors",
            isSelected 
              ? "bg-primary/20 border-primary" 
              : "bg-muted border-border"
          )}
        >
          {isSelected ? (
            <Check className="w-5 h-5 text-primary" />
          ) : !selectable ? (
            <Lock className="w-4 h-4 text-muted-foreground" />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-bold text-foreground truncate uppercase">{name}</p>
          <p className="font-mono text-xs text-muted-foreground truncate">{rollNo}</p>
          {!selectable && (
            <p className="text-xs text-muted-foreground">Unavailable</p>
          )}
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </CyberCardContent>
    </CyberCard>
  );
}
