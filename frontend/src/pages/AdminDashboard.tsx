import { useState, useEffect, useCallback } from "react";
import { 
  Download, ShieldAlert, Layers, LogOut, Search, 
  User, Users, Unlock, Lock, Zap, Trash2, UserPlus, 
  X, AlertTriangle, Check
} from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";
import { CyberCard, CyberCardContent, CyberCardHeader, CyberCardTitle } from "@/components/ui/cyber-card";
import { SplineBackground } from "@/components/SplineBackground";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Student {
  rollNo: string;
  name: string;
  teamId: string | null;
  editAttemptsLeft: number;
  choices: string[];
}

interface Team {
  _id: string;
  batch: string;
  members: string[];
  createdAt: string;
}

interface BatchStatus {
  selectionOpen: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminKey = localStorage.getItem("banana_admin_key");

  const [loading, setLoading] = useState(true);
  const [activeBatch, setActiveBatch] = useState<"A" | "B">("A");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [statuses, setStatuses] = useState<Record<string, BatchStatus>>({});
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showManualCreate, setShowManualCreate] = useState(false);
  const [manualMembers, setManualMembers] = useState<string[]>([]);

  const fetchStatus = useCallback(async () => {
    if (!adminKey) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/selection/status`, {
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) setStatuses(await res.json());
    } catch (err) {
      console.error("Failed to fetch status", err);
    }
  }, [adminKey]);

  const fetchData = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/dashboard?batch=${activeBatch}`, {
        headers: { "x-admin-key": adminKey }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("banana_admin_key");
          navigate("/banana");
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }
      
      const data = await res.json();
      setStudents(data.students || []);
      setTeams(data.teams || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminKey, activeBatch, navigate]);

  useEffect(() => {
    if (!adminKey) {
      navigate("/banana");
      return;
    }
    fetchStatus();
    fetchData();
  }, [adminKey, fetchData, fetchStatus, navigate]);

  const handleToggleSelection = async (batch: string, currentStatus: boolean) => {
    const endpoint = currentStatus ? "close" : "open";
    setActionLoading(`toggle-${batch}`);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/selection/${endpoint}`, {
        method: "POST",
        headers: { 
          "x-admin-key": adminKey!,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ batch })
      });
      if (res.ok) {
        toast.success(`Selection ${endpoint}ed for Batch ${batch}`);
        fetchStatus();
      } else {
        throw new Error("Action failed");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDissolveTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to dissolve this team?")) return;
    setActionLoading(`dissolve-${teamId}`);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/team/${teamId}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey! }
      });
      if (res.ok) {
        toast.success("Team dissolved successfully");
        fetchData();
      } else {
        throw new Error("Failed to dissolve team");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinalize = async () => {
    if (!confirm(`CRITICAL ACTION: This will close selection for Batch ${activeBatch} and automatically group remaining students. Proceed?`)) return;
    setActionLoading("finalize");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/finalize`, {
        method: "POST",
        headers: { 
          "x-admin-key": adminKey!,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ batch: activeBatch })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Finalized! Created ${data.teamsCreated} new teams.`);
        fetchData();
        fetchStatus();
      } else {
        throw new Error(data.error || "Finalization failed");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualCreate = async () => {
    if (manualMembers.length === 0) return;
    setActionLoading("manual-create");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/team/manual`, {
        method: "POST",
        headers: { 
          "x-admin-key": adminKey!,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          batch: activeBatch,
          members: manualMembers 
        })
      });
      if (res.ok) {
        toast.success("Team created manually");
        setShowManualCreate(false);
        setManualMembers([]);
        fetchData();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to create team");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    setActionLoading("export");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/export/teams?batch=${activeBatch}`, {
        headers: { "x-admin-key": adminKey! },
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teams_batch_${activeBatch}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Export successful for Batch ${activeBatch}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("banana_admin_key");
    navigate("/banana");
    toast.success("Admin session ended");
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <SplineBackground className="opacity-20 fixed inset-0" />
      
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl relative">
        <div className="container max-w-7xl flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-primary" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tighter">BANANA PROTOCOL</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {["A", "B"].map(b => (
                <button
                  key={b}
                  onClick={() => setActiveBatch(b as any)}
                  className={`px-3 py-1.5 font-mono text-[10px] sm:text-xs rounded transition-all ${
                    activeBatch === b 
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  BATCH {b}
                </button>
              ))}
            </div>
            <div className="h-6 w-px bg-white/10 mx-1 sm:mx-2" />
            <CyberButton variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </CyberButton>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-7xl py-8 space-y-8 relative z-10">
        <div className="grid gap-6 md:grid-cols-3">
          <CyberCard variant="glow" className="md:col-span-2">
            <CyberCardHeader className="flex flex-row items-center justify-between pb-2">
              <CyberCardTitle className="text-xs uppercase tracking-widest text-primary">Phase Control Unit</CyberCardTitle>
              <Zap className="w-4 h-4 text-primary animate-pulse" />
            </CyberCardHeader>
            <CyberCardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {["A", "B"].map(b => {
                const isOpen = statuses[b]?.selectionOpen;
                const isCurrent = activeBatch === b;
                return (
                  <div 
                    key={b} 
                    onClick={() => setActiveBatch(b as any)}
                    className={`p-4 rounded-lg border flex flex-col gap-3 transition-all cursor-pointer ${
                      isCurrent 
                        ? 'bg-primary/5 border-primary/30 shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]' 
                        : 'bg-muted/20 border-white/5 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-bold">Batch {b}</span>
                      <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-success animate-pulse' : 'bg-destructive'} cyber-glow`} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <CyberButton 
                        size="sm" 
                        variant={isOpen ? "secondary" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelection(b, !!isOpen);
                        }}
                        disabled={actionLoading === `toggle-${b}`}
                        className="w-full text-[10px]"
                      >
                        {actionLoading === `toggle-${b}` ? <LoadingSpinner size="sm" /> : isOpen ? <Lock className="w-3 h-3 mr-2" /> : <Unlock className="w-3 h-3 mr-2" />}
                        {isOpen ? "CLOSE SELECTION" : "OPEN SELECTION"}
                      </CyberButton>
                      
                      {isCurrent && (
                        <CyberButton 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFinalize();
                          }}
                          disabled={actionLoading === "finalize"}
                          className="w-full text-[10px] text-destructive hover:bg-destructive/10"
                        >
                          <Zap className="w-3 h-3 mr-2" />
                          FINALIZE REMAINING
                        </CyberButton>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="p-4 rounded-lg bg-background/40 border border-white/5 flex flex-col justify-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Get Offline Data</span>
                <CyberButton size="sm" variant="outline" className="w-full" onClick={handleExport} disabled={actionLoading === "export"}>
                  <Download className="w-3 h-3 mr-2" />
                  EXPORT EXCEL
                </CyberButton>
              </div>
            </CyberCardContent>
          </CyberCard>

          <CyberCard>
            <CyberCardHeader>
              <CyberCardTitle className="text-xs uppercase tracking-widest text-primary">Live Stats</CyberCardTitle>
            </CyberCardHeader>
            <CyberCardContent className="space-y-4">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-xs text-muted-foreground uppercase">Unassigned</span>
                <span className="font-mono text-2xl font-bold">{students.filter(s => !s.teamId).length}</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-xs text-muted-foreground uppercase">Teams Formed</span>
                <span className="font-mono text-2xl font-bold text-primary">{teams.length}</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-xs text-muted-foreground uppercase">Batch Total</span>
                <span className="font-mono text-2xl font-bold">{students.length}</span>
              </div>
            </CyberCardContent>
          </CyberCard>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search Student Matrix (Name or Roll No)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 font-mono text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <CyberButton onClick={() => setShowManualCreate(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            MANUAL OVERRIDE
          </CyberButton>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-primary" />
              <h2 className="font-mono text-[10px] uppercase tracking-widest font-bold">Student Registry</h2>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center border border-white/5 rounded-xl bg-background/20">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredStudents.length === 0 ? (
                  <div className="sm:col-span-2 h-32 flex items-center justify-center border border-white/5 rounded-xl bg-background/20 text-muted-foreground text-xs font-mono">
                    NO ENTRIES MATCH QUERY
                  </div>
                ) : (
                  filteredStudents.map(student => {
                    const isAssigned = !!student.teamId;
                    return (
                      <CyberCard 
                        key={student.rollNo} 
                        className={`relative group transition-all duration-300 ${
                          isAssigned 
                            ? 'opacity-40 grayscale-[0.5] border-white/5' 
                            : 'cyber-glow-sm border-primary/30 bg-primary/5 hover:bg-primary/10'
                        }`}
                      >
                        <CyberCardContent className="p-3 flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                            isAssigned 
                              ? 'bg-muted/10 border-white/5 text-muted-foreground' 
                              : 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]'
                          }`}>
                            {isAssigned ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-mono text-sm font-bold truncate uppercase ${isAssigned ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {student.name}
                              </p>
                              {isAssigned && (
                                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground uppercase tracking-widest">
                                  Assigned
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-[10px] text-muted-foreground/60">{student.rollNo}</p>
                          </div>

                          {!isAssigned && student.choices.length > 0 && (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[7px] font-mono text-primary/60 uppercase">Interests</span>
                              <div className="flex -space-x-1.5">
                                {student.choices.map((c, i) => (
                                  <div 
                                    key={i} 
                                    className="w-4 h-4 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[7px] font-mono text-primary group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(var(--primary),0.2)]" 
                                    title={`Choice ${i+1}: ${c}`}
                                  >
                                    {i + 1}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CyberCardContent>
                      </CyberCard>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="font-mono text-[10px] uppercase tracking-widest font-bold">Formed Teams</h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)
              ) : teams.length === 0 ? (
                <div className="h-32 flex items-center justify-center border border-white/5 rounded-xl bg-background/20 text-muted-foreground text-xs font-mono">
                  NO TEAMS FORMED
                </div>
              ) : (
                teams.map(team => (
                  <CyberCard key={team._id} variant="default" className="border-white/5 relative group">
                    <CyberCardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{team._id.slice(-8)}</span>
                        <button 
                          onClick={() => handleDissolveTeam(team._id)}
                          disabled={actionLoading === `dissolve-${team._id}`}
                          className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {team.members.map(m => {
                          const student = students.find(s => s.rollNo === m);
                          return (
                            <div key={m} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-primary" />
                              <div className="flex flex-col">
                                <span className="font-mono text-[10px] leading-tight uppercase font-bold">{student?.name || "Unknown"}</span>
                                <span className="font-mono text-[8px] leading-none text-muted-foreground opacity-60">{m}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CyberCardContent>
                  </CyberCard>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {showManualCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <CyberCard variant="glow" className="max-w-2xl w-full">
            <CyberCardHeader className="flex flex-row items-center justify-between">
              <CyberCardTitle>Manual Team Override</CyberCardTitle>
              <button onClick={() => setShowManualCreate(false)} className="p-1 hover:bg-white/10 rounded"><X className="w-5 h-5"/></button>
            </CyberCardHeader>
            <CyberCardContent className="space-y-6">
              <div className="text-xs text-muted-foreground font-mono bg-primary/5 p-3 rounded border border-primary/20">
                <AlertTriangle className="w-3 h-3 text-primary inline mr-2" />
                Select 1 to 3 students to form a team. This bypasses mutual consent rules but enforces batch isolation.
              </div>

              <div className="max-h-64 overflow-y-auto grid gap-2">
                {students.filter(s => !s.teamId).map(s => (
                  <button
                    key={s.rollNo}
                    onClick={() => {
                      if (manualMembers.includes(s.rollNo)) {
                        setManualMembers(manualMembers.filter(m => m !== s.rollNo));
                      } else if (manualMembers.length < 3) {
                        setManualMembers([...manualMembers, s.rollNo]);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded border transition-all ${
                      manualMembers.includes(s.rollNo) 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-white/5 border-white/5 text-muted-foreground'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-mono text-sm font-bold uppercase">{s.name}</span>
                      <span className="font-mono text-[10px]">{s.rollNo}</span>
                    </div>
                    {manualMembers.includes(s.rollNo) && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <CyberButton 
                  variant="ghost" 
                  className="flex-1"
                  onClick={() => setShowManualCreate(false)}
                >CANCEL</CyberButton>
                <CyberButton 
                  className="flex-1"
                  disabled={manualMembers.length === 0 || actionLoading === "manual-create"}
                  onClick={handleManualCreate}
                >
                  {actionLoading === "manual-create" ? "PROCESSING..." : `CREATE TEAM (${manualMembers.length})`}
                </CyberButton>
              </div>
            </CyberCardContent>
          </CyberCard>
        </div>
      )}
    </div>
  );
}
