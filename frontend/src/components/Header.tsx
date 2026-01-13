import { Shield, LogOut } from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";
import { StatusIndicator } from "@/components/ui/status-indicator";

interface HeaderProps {
  username?: string | null;
  batch?: string | null;
  onLogout?: () => void;
  showLogout?: boolean;
}

export function Header({ username, batch, onLogout, showLogout = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm font-semibold tracking-wide">
            GROUPIFY
          </span>
        </div>

        <div className="flex items-center gap-4">
          {username && (
            <div className="hidden sm:flex items-center gap-3">
              <StatusIndicator status="online" />
              <span className="font-mono text-xs text-muted-foreground">
                {username}
              </span>
              {batch && (
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-secondary text-secondary-foreground">
                  BATCH {batch}
                </span>
              )}
            </div>
          )}
          
          {showLogout && onLogout && (
            <CyberButton variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </CyberButton>
          )}
        </div>
      </div>
    </header>
  );
}
