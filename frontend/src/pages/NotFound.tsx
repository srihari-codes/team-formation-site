import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Shield, Home } from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";
import { CyberCard, CyberCardContent } from "@/components/ui/cyber-card";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background grid-pattern flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <p className="font-mono text-6xl font-bold text-primary">404</p>
          <h1 className="font-mono text-xl font-semibold">Path Not Found</h1>
          <p className="text-sm text-muted-foreground">
            The requested resource does not exist in this system.
          </p>
        </div>

        <CyberCard>
          <CyberCardContent>
            <CyberButton className="w-full" onClick={() => navigate("/")}>
              <Home className="w-4 h-4" />
              Return to Login
            </CyberButton>
          </CyberCardContent>
        </CyberCard>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-mono">GROUPIFY PROTOCOL</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
