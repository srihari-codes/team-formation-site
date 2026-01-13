import { Shield, Lock } from "lucide-react";
import { CyberCard, CyberCardContent } from "@/components/ui/cyber-card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SplineBackground } from "@/components/SplineBackground";

export default function LockedState() {
  return (
    <div className="min-h-screen bg-background grid-pattern relative">
      <SplineBackground 
        className="opacity-50"
      />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-muted border border-border">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-mono text-xl font-bold">Selection Phase Closed</h1>
            <p className="text-sm text-muted-foreground">
              The team selection period has ended for your batch.
            </p>
          </div>

          <CyberCard>
            <CyberCardContent className="space-y-4">
              <StatusIndicator status="locked" label="SELECTION LOCKED" className="justify-center" />
              <p className="text-xs font-mono text-muted-foreground">
                Contact your administrator for more information about team assignments.
              </p>
            </CyberCardContent>
          </CyberCard>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-mono">GROUPIFY PROTOCOL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
