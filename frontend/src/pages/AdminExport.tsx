import { useState } from "react";
import { ShieldAlert, Key, ArrowRight } from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";
import { CyberCard, CyberCardContent, CyberCardHeader, CyberCardTitle } from "@/components/ui/cyber-card";
import { SplineBackground } from "@/components/SplineBackground";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminLogin() {
  const [adminKey, setAdminKey] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminKey) {
      toast.error("Access key required");
      return;
    }

    // Save key to localStorage for use in the dashboard
    localStorage.setItem("banana_admin_key", adminKey);
    toast.success("Identity Verified. Entering Banana Protocol.");
    navigate("/banana-dash");
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      <SplineBackground className="opacity-40" />
      
      <div className="relative z-10 w-full max-w-md">
        <CyberCard variant="glow">
          <CyberCardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <CyberCardTitle className="text-2xl">Enter Admin Mode</CyberCardTitle>
            <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-widest">
              Identity Verification Required
            </p>
          </CyberCardHeader>
          
          <CyberCardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                  <Key className="w-3 h-3" />
                  Banana Secret Key
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter access key..."
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-mono focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all text-center tracking-widest"
                  autoFocus
                />
              </div>

              <CyberButton 
                type="submit" 
                className="w-full" 
                size="xl"
              >
                Access Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </CyberButton>
            </form>
          </CyberCardContent>
        </CyberCard>
        
        <p className="text-center text-[10px] font-mono text-muted-foreground mt-8 uppercase tracking-widest opacity-50">
          Banana Protocol v1.0 // restricted access
        </p>
      </div>
    </div>
  );
}
