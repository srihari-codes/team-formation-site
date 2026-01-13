import { useState } from "react";
import { Download, ShieldAlert, Key, Layers } from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";
import { CyberCard, CyberCardContent, CyberCardHeader, CyberCardTitle } from "@/components/ui/cyber-card";
import { SplineBackground } from "@/components/SplineBackground";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";

export default function AdminExport() {
  const [adminKey, setAdminKey] = useState("");
  const [batch, setBatch] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminKey) {
      toast.error("Admin key is required");
      return;
    }
    if (!batch) {
      toast.error("Batch specification is required");
      return;
    }

    setExporting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/export/teams?batch=${batch.toUpperCase()}`, {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Export failed");
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teams_batch_${batch.toUpperCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Export successful for Batch ${batch.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      <SplineBackground className="opacity-40" />
      
      <div className="relative z-10 w-full max-w-md">
        <CyberCard variant="glow">
          <CyberCardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6 text-primary" />
            </div>
            <CyberCardTitle className="text-xl">Banana Protocol</CyberCardTitle>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Restricted Admin Access - Data Export Utility
            </p>
          </CyberCardHeader>
          
          <CyberCardContent>
            <form onSubmit={handleExport} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                  <Key className="w-3 h-3" />
                  Access Key
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter Admin Secret..."
                  className="w-full bg-background/50 border border-border rounded px-3 py-2 text-sm font-mono focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                  <Layers className="w-3 h-3" />
                  Target Batch
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {["A", "B"].map((b) => (
                    <label
                      key={b}
                      className={`
                        flex items-center justify-center gap-2 p-3 rounded border transition-all cursor-pointer font-mono text-sm
                        ${batch === b 
                          ? "bg-primary/20 border-primary text-primary cyber-glow-sm" 
                          : "bg-background/50 border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/5"}
                      `}
                    >
                      <input
                        type="radio"
                        name="batch"
                        value={b}
                        checked={batch === b}
                        onChange={(e) => setBatch(e.target.value)}
                        className="hidden"
                      />
                      Batch {b}
                    </label>
                  ))}
                </div>
              </div>

              <CyberButton 
                type="submit" 
                className="w-full mt-2" 
                disabled={exporting}
              >
                {exporting ? (
                  "Processing..."
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Matrix (.xlsx)
                  </>
                )}
              </CyberButton>
            </form>
          </CyberCardContent>
        </CyberCard>
        
        <p className="text-center text-[10px] font-mono text-muted-foreground mt-6 uppercase tracking-widest">
          Session integrity enforced by Groupify Security
        </p>
      </div>
    </div>
  );
}
