import { CyberCard, CyberCardContent } from "@/components/ui/cyber-card";
import { User, Crown } from "lucide-react";

interface TeamMemberCardProps {
  rollNo: string;
  isCurrentUser?: boolean;
}

export function TeamMemberCard({ rollNo, isCurrentUser }: TeamMemberCardProps) {
  return (
    <CyberCard variant={isCurrentUser ? "glow" : "default"}>
      <CyberCardContent className="flex items-center gap-3">
        <div 
          className={`w-12 h-12 rounded-md flex items-center justify-center border ${
            isCurrentUser ? "bg-primary/20 border-primary" : "bg-muted border-border"
          }`}
        >
          {isCurrentUser ? (
            <Crown className="w-5 h-5 text-primary" />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1">
          <p className="font-mono text-sm text-foreground">{rollNo}</p>
          {isCurrentUser && (
            <p className="text-xs text-primary">You</p>
          )}
        </div>
      </CyberCardContent>
    </CyberCard>
  );
}
