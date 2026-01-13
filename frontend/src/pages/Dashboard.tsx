import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, Lock, Edit3 } from "lucide-react";
import { Header } from "@/components/Header";
import { CyberButton } from "@/components/ui/cyber-button";
import { CyberCard, CyberCardContent, CyberCardHeader, CyberCardTitle } from "@/components/ui/cyber-card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { SplineBackground } from "@/components/SplineBackground";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL, getAuthHeader } from "@/config/api";
import type { UserProfile } from "@/types/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, logout, username, batch } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to hydrate from localStorage
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch(`${API_BASE_URL}/me`, {
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
          setProfile(data);
          // If already in a team, redirect to team status
          if (data.teamId) {
            navigate("/team/status");
          }
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [isAuthenticated, authLoading, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header username={username} batch={batch} onLogout={handleLogout} />
        <main className="container py-8">
          <CyberCard variant="default">
            <CyberCardContent className="text-center py-8">
              <p className="text-destructive font-mono">{error}</p>
              <CyberButton className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </CyberButton>
            </CyberCardContent>
          </CyberCard>
        </main>
      </div>
    );
  }

  const hasChoices = profile && profile.currentChoices.length > 0;
  const isLocked = profile && profile.editAttemptsLeft === 0;

  return (
    <div className="min-h-screen bg-background relative">
      <SplineBackground 
        sceneUrl="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
        className="opacity-10"
      />
      
      <div className="relative z-10">
        <Header username={username} batch={batch} onLogout={handleLogout} />
        
        <main className="container py-6 space-y-6">
          {/* Status Banner */}
          <CyberCard variant="glow">
            <CyberCardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIndicator 
                  status={isLocked ? "locked" : hasChoices ? "pending" : "online"} 
                />
                <span className="font-mono text-sm">
                  {isLocked 
                    ? "Selection Locked" 
                    : hasChoices 
                      ? "Waiting for Consensus" 
                      : "Ready to Select"}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                BATCH {profile?.batch}
              </span>
            </CyberCardContent>
          </CyberCard>

          {/* Profile Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <CyberCard>
              <CyberCardHeader>
                <CyberCardTitle>Your Roll Number</CyberCardTitle>
              </CyberCardHeader>
              <CyberCardContent>
                <p className="font-mono text-lg text-foreground">{profile?.rollNo}</p>
              </CyberCardContent>
            </CyberCard>

            <CyberCard>
              <CyberCardHeader>
                <CyberCardTitle>Edit Attempts</CyberCardTitle>
              </CyberCardHeader>
              <CyberCardContent className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm ${
                        i < (profile?.editAttemptsLeft || 0)
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-sm text-muted-foreground">
                  {profile?.editAttemptsLeft} remaining
                </span>
              </CyberCardContent>
            </CyberCard>
          </div>

          {/* Current Selection Status */}
          {hasChoices && (
            <CyberCard>
              <CyberCardHeader>
                <CyberCardTitle>Current Selection</CyberCardTitle>
              </CyberCardHeader>
              <CyberCardContent className="space-y-3">
                {profile?.currentChoices.map((choice, index) => (
                  <div key={choice} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                    <span className="w-6 h-6 rounded flex items-center justify-center bg-primary/20 text-xs font-mono text-primary">
                      {index + 1}
                    </span>
                    <span className="font-mono text-sm">{choice}</span>
                  </div>
                ))}
              </CyberCardContent>
            </CyberCard>
          )}

          {/* Action Button */}
          <div className="space-y-3">
            {isLocked ? (
              <CyberCard variant="default">
                <CyberCardContent className="flex items-center justify-center gap-3 py-6">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <span className="font-mono text-sm text-muted-foreground">
                    Selection locked. No more changes allowed.
                  </span>
                </CyberCardContent>
              </CyberCard>
            ) : (
              <CyberButton
                className="w-full"
                size="xl"
                onClick={() => navigate("/team/select")}
              >
                <Users className="w-5 h-5" />
                {hasChoices ? (
                  <>
                    <Edit3 className="w-4 h-4" />
                    Edit Selection
                  </>
                ) : (
                  <>
                    Select Teammates
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </CyberButton>
            )}

            <CyberButton
              variant="secondary"
              className="w-full"
              onClick={() => navigate("/team/status")}
            >
              Check Team Status
            </CyberButton>
          </div>

          {/* Info */}
          <div className="p-4 rounded-md bg-muted/30 border border-border">
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              Select exactly 2 teammates from your batch. A team forms only when all 3 members 
              mutually select each other. You have {profile?.editAttemptsLeft} edit attempt(s) remaining.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
