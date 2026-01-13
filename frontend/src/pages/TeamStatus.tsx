import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { Header } from "@/components/Header";
import { CyberButton } from "@/components/ui/cyber-button";
import { CyberCard, CyberCardContent, CyberCardHeader, CyberCardTitle } from "@/components/ui/cyber-card";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { LoadingScreen, LoadingSpinner } from "@/components/ui/loading-spinner";
import { SplineBackground } from "@/components/SplineBackground";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL, getAuthHeader } from "@/config/api";
import type { TeamStatus } from "@/types/api";
import { Footer } from "@/components/Footer";

export default function TeamStatusPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, logout, username, batch, name } = useAuth();
  
  const [status, setStatus] = useState<TeamStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/team/status`, {
        headers: getAuthHeader(),
      });

      if (res.status === 401) {
        logout();
        navigate("/");
        return;
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setStatus(data);
      }
    } catch {
      setError("Failed to load team status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetchStatus();
  }, [isAuthenticated, authLoading, navigate, fetchStatus]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Loading team status..." />;
  }

  const isFormed = status?.state === "formed";

  return (
    <div className="min-h-screen bg-background relative">
      <SplineBackground 
        className="opacity-60"
      />
      
      <div className="relative z-10">
        <Header username={name || username} batch={batch} onLogout={handleLogout} />
        
        <main className="flex-1">
          <div className="container max-w-4xl py-6 space-y-6">
          {/* Back Button */}
          {!isFormed && (
            <CyberButton variant="ghost" onClick={() => navigate("/me")}>
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </CyberButton>
          )}

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30">
              <p className="text-xs font-mono text-destructive">{error}</p>
            </div>
          )}

          {isFormed ? (
            /* Team Formed State */
            <div className="space-y-6">
              <CyberCard variant="glow">
                <CyberCardContent className="text-center py-8 space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 border border-success/30">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <h2 className="font-mono text-xl font-bold">Team Formed</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Mutual selection confirmed
                    </p>
                  </div>
                  <StatusIndicator status="success" label="GROUPIFIED" className="justify-center" />
                </CyberCardContent>
              </CyberCard>

              <CyberCardHeader>
                <CyberCardTitle>Team Members</CyberCardTitle>
              </CyberCardHeader>
              
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {status.team?.map((rollNo) => (
                  <TeamMemberCard
                    key={rollNo}
                    rollNo={rollNo}
                    isCurrentUser={rollNo === username}
                  />
                ))}
              </div>

              <div className="p-4 rounded-md bg-muted/30 border border-border">
                <p className="text-xs font-mono text-muted-foreground text-center">
                  All 3 team members mutually selected each other. Team formation is complete.
                </p>
              </div>
            </div>
          ) : (
            /* Pending State */
            <div className="space-y-6">
              <CyberCard variant="default">
                <CyberCardContent className="text-center py-12 space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/20 border border-warning/30 animate-pulse">
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                  <div>
                    <h2 className="font-mono text-xl font-bold">Awaiting Match</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Team formation in progress
                    </p>
                  </div>
                  <StatusIndicator status="pending" label="WAITING" className="justify-center" />
                </CyberCardContent>
              </CyberCard>

              <div className="p-4 rounded-md bg-muted/30 border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-mono text-muted-foreground">
                    A team forms when all 3 members mutually select each other.
                  </p>
                </div>
                <p className="text-xs font-mono text-muted-foreground">
                  Selection details are private to prevent social conflicts.
                </p>
              </div>

              <div className="grid gap-3 max-w-md mx-auto w-full pt-4">
                <CyberButton
                  variant="secondary"
                  className="w-full"
                  onClick={() => fetchStatus(true)}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Refresh Status
                    </>
                  )}
                </CyberButton>
                
                <CyberButton
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/team/select")}
                >
                  Edit Selection
                </CyberButton>
              </div>
            </div>
          )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
