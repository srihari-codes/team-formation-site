import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check, ArrowLeft, Send, X, Info, UserPlus } from "lucide-react";
import { Header } from "@/components/Header";
import { CyberButton } from "@/components/ui/cyber-button";
import { CyberCard, CyberCardContent, CyberCardHeader, CyberCardTitle } from "@/components/ui/cyber-card";
import { StudentCard } from "@/components/StudentCard";
import { LoadingScreen, LoadingSpinner } from "@/components/ui/loading-spinner";
import { SplineBackground } from "@/components/SplineBackground";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL, getAuthHeader } from "@/config/api";
import type { Student, UserProfile } from "@/types/api";
import { Footer } from "@/components/Footer";

export default function TeamSelection() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, logout, username, batch, name } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedRolls, setSelectedRolls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const headers = getAuthHeader();
      
      const [profileRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/me`, { headers }),
        fetch(`${API_BASE_URL}/students`, { headers }),
      ]);

      if (profileRes.status === 401 || studentsRes.status === 401) {
        logout();
        navigate("/");
        return;
      }

      const [profileData, studentsData] = await Promise.all([
        profileRes.json(),
        studentsRes.json(),
      ]);

      if (profileData.error) {
        setError(profileData.error);
        return;
      }

      if (profileData.teamId) {
        navigate("/team/status");
        return;
      }

      if (profileData.editAttemptsLeft === 0) {
        setError("No edit attempts remaining. Selection is locked.");
      }

      setProfile(profileData);
      setStudents(studentsData.students || []);
      setSelectedRolls(profileData.currentChoices || []);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetchData();
  }, [isAuthenticated, authLoading, navigate, fetchData]);

  const handleSelect = (rollNo: string) => {
    if (selectedRolls.includes(rollNo)) {
      // Already selected - unselect
      setSelectedRolls(prev => prev.filter(r => r !== rollNo));
    } else if (selectedRolls.length < 2) {
      // Add to selection
      setSelectedRolls(prev => [...prev, rollNo]);
    }
    setError(null);
  };

  const handleRemove = (rollNo: string) => {
    setSelectedRolls(prev => prev.filter(r => r !== rollNo));
    setError(null);
  };

  const handleConfirmClick = () => {
    if (selectedRolls.length !== 2) {
      setError("Please select exactly 2 teammates before submitting");
      return;
    }
    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    setShowConfirmation(false);

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/team/selection`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ choices: selectedRolls }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.teamFormed) {
        navigate("/team/status");
      } else if (data.saved) {
        // Redirect to dashboard after successful save
        navigate("/me");
      }
    } catch {
      setError("Failed to submit selection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Loading students..." />;
  }

  const selectableStudents = students.filter((s) => s.selectable && s.rollNo !== username);
  const unavailableStudents = students.filter((s) => !s.selectable && s.rollNo !== username);
  const canSubmit = selectedRolls.length === 2 && profile && profile.editAttemptsLeft > 0;
  const hasChanges = JSON.stringify(selectedRolls.sort()) !== JSON.stringify((profile?.currentChoices || []).sort());
  const isEditMode = (profile?.currentChoices?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-background relative">
      <SplineBackground 
        className="opacity-50"
      />
      
      <div className="relative z-10">
        <Header username={name || username} batch={batch} onLogout={handleLogout} />
        
        <main className="flex-1">
          <div className="container max-w-5xl py-6 space-y-6 pb-24">
          {/* Back Button */}
          <CyberButton variant="ghost" onClick={() => navigate("/me")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </CyberButton>

          {/* Instructions Box */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 cyber-glow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-mono text-sm font-bold text-foreground capitalize">
                  {isEditMode ? "Protocol: Update Team Selection" : "Protocol: Teammate Selection"}
                </p>
                <ul className="text-xs font-mono text-foreground/80 space-y-1.5">
                  <li><span className="text-primary">01.</span> Tap a student card to <span className="text-primary font-bold">ADD</span> to selection.</li>
                  <li><span className="text-primary">02.</span> Tap again to <span className="text-primary font-bold">REMOVE</span> from selection.</li>
                  <li><span className="text-primary">03.</span> Select exactly <span className="text-primary font-bold underline underline-offset-2">2 teammates</span> to proceed.</li>
                </ul>
                {isEditMode && (
                  <div className="pt-1">
                    <span className="px-2 py-0.5 rounded bg-warning/20 text-warning text-[10px] font-bold border border-warning/20 uppercase tracking-wider">
                      {profile?.editAttemptsLeft} Attempts Remaining
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Teammates Section */}
          <CyberCard variant={selectedRolls.length === 2 ? "glow" : "default"}>
            <CyberCardHeader className="pb-2">
              <CyberCardTitle className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Your Selection ({selectedRolls.length}/2)
              </CyberCardTitle>
            </CyberCardHeader>
            <CyberCardContent>
              {selectedRolls.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No teammates selected yet. Tap on students below to select them.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedRolls.map((rollNo, index) => {
                    const student = students.find(s => s.rollNo === rollNo);
                    return (
                      <div 
                        key={rollNo}
                        className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-xs font-mono text-primary">
                            {index + 1}
                          </span>
                          <div className="flex flex-col truncate">
                            <span className="font-mono text-sm font-bold uppercase truncate">{student?.name || rollNo}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">{rollNo}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemove(rollNo)}
                          className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                          title="Remove from selection"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  {selectedRolls.length === 1 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Select 1 more teammate to proceed
                    </p>
                  )}
                  {selectedRolls.length === 2 && (
                    <div className="flex items-center justify-center gap-2 pt-2 text-primary">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-mono">Ready to submit!</span>
                    </div>
                  )}
                </div>
              )}
            </CyberCardContent>
          </CyberCard>

          {/* Warning for last attempt */}
          {profile && profile.editAttemptsLeft === 1 && (
            <div className="p-3 rounded-md bg-warning/10 border border-warning/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs font-mono text-warning">
                This is your last edit attempt. Choose carefully - your selection will be locked after this.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30">
              <p className="text-xs font-mono text-destructive">{error}</p>
            </div>
          )}

          {/* Available Students */}
          {selectableStudents.length > 0 && (
            <div className="space-y-3">
              <CyberCardHeader className="pb-0">
                <CyberCardTitle>
                  Available Students
                  {selectedRolls.length >= 2 && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      (tap selected students to remove them)
                    </span>
                  )}
                </CyberCardTitle>
              </CyberCardHeader>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectableStudents.map((student) => {
                  const isSelected = selectedRolls.includes(student.rollNo);
                  const isDisabled = profile?.editAttemptsLeft === 0 || 
                    (!isSelected && selectedRolls.length >= 2);
                  
                  return (
                    <StudentCard
                      key={student.rollNo}
                      rollNo={student.rollNo}
                      name={student.name}
                      selectable={student.selectable}
                      isSelected={isSelected}
                      onToggle={handleSelect}
                      disabled={isDisabled}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Unavailable Students */}
          {unavailableStudents.length > 0 && (
            <div className="space-y-3">
              <CyberCardHeader className="pb-0">
                <CyberCardTitle className="text-muted-foreground">Already in Teams</CyberCardTitle>
              </CyberCardHeader>
              <div className="grid gap-3 opacity-50 sm:grid-cols-2 lg:grid-cols-3">
                {unavailableStudents.map((student) => (
                  <StudentCard
                    key={student.rollNo}
                    rollNo={student.rollNo}
                    name={student.name}
                    selectable={false}
                    isSelected={false}
                    onToggle={() => {}}
                    disabled
                  />
                ))}
              </div>
            </div>
          )}
          </div>
        </main>
        <Footer />

        {/* Fixed Submit Button at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border">
          <div className="container max-w-5xl">
            <CyberButton
              className="w-full"
              size="xl"
              disabled={!canSubmit || submitting || !hasChanges}
              onClick={handleConfirmClick}
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : !canSubmit ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Select 2 Teammates First
                </>
              ) : !hasChanges ? (
                <>
                  <Check className="w-4 h-4" />
                  No Changes to Save
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {isEditMode ? "Update & Save Selection" : "Submit Selection"}
                </>
              )}
            </CyberButton>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <CyberCard variant="glow" className="max-w-md w-full">
              <CyberCardHeader>
                <CyberCardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Confirm Your Selection
                </CyberCardTitle>
              </CyberCardHeader>
              <CyberCardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You are about to submit your team selection:
                  </p>
                  <div className="space-y-2">
                    {selectedRolls.map((rollNo, index) => {
                      const student = students.find(s => s.rollNo === rollNo);
                      return (
                        <div key={rollNo} className="flex items-center gap-3 p-2 rounded-md bg-primary/10 border border-primary/30">
                          <span className="w-5 h-5 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-xs font-mono text-primary">
                            {index + 1}
                          </span>
                          <div className="flex flex-col truncate">
                            <span className="font-mono text-sm font-bold uppercase truncate">{student?.name || rollNo}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">{rollNo}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-md bg-warning/10 border border-warning/30">
                  <p className="text-xs font-mono text-warning">
                    ⚠️ You have only <strong>{profile?.editAttemptsLeft} edit attempt(s)</strong> remaining.
                    {profile?.editAttemptsLeft === 1 && " This will be your LAST change!"}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  A team forms only when all 3 members mutually select each other. Are you sure you want to proceed?
                </p>

                <div className="flex gap-3 pt-2">
                  <CyberButton
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowConfirmation(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </CyberButton>
                  <CyberButton
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Confirm & Submit
                      </>
                    )}
                  </CyberButton>
                </div>
              </CyberCardContent>
            </CyberCard>
          </div>
        )}
      </div>
    </div>
  );
}
