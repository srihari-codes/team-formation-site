import React from "react";
import { Link } from "react-router-dom";
import { CyberButton } from "@/components/ui/cyber-button";
import {
  CyberCard,
  CyberCardContent,
  CyberCardHeader,
  CyberCardTitle,
} from "@/components/ui/cyber-card";
import { SplineBackground } from "@/components/SplineBackground";
import { GROUPIFY_LOGO } from "@/config/assets";
import { Footer } from "@/components/Footer";
import {
  Users,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  MessageSquare,
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground grid-pattern relative overflow-hidden">
      <SplineBackground 
        className="opacity-80 pointer-events-none"
      />

      {/* TOP HEADER - IMMEDIATE ACCESS */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <img src={GROUPIFY_LOGO} alt="Groupify Logo" className="w-8 h-8 object-contain" />
            <span className="font-mono text-sm font-bold tracking-tighter uppercase">Groupify</span>
          </div>
          <Link to="/login">
            <CyberButton variant="ghost" size="sm" className="font-mono text-xs">
              <Lock className="w-3 h-3 mr-2" />
              LOGIN ACCESS
            </CyberButton>
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex flex-col items-center p-4 md:p-8">
        <div className="max-w-4xl w-full space-y-12 py-10">
          
          {/* HERO SECTION - LOGIN IS NOW TOP VISIBLE */}
          <section className="text-center space-y-8 pt-6 md:pt-12">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground cyber-text-glow leading-tight font-mono">
                Groupify<br/>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto backdrop-blur-sm p-2 rounded-lg leading-relaxed">
                A secure system where teams form only through <span className="text-foreground font-semibold">mutual consensus</span>. 
                Verify your credentials to begin selection.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/login" className="w-full sm:w-auto">
                <CyberButton size="xl" className="w-full sm:w-auto px-12 group shadow-[0_0_30px_rgba(var(--primary),0.2)] hover:shadow-[0_0_40px_rgba(var(--primary),0.4)]">
                  Proceed to Login
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </CyberButton>
              </Link>
            </div>
          </section>
{/* COORDINATION ADVICE */}
          <section className="space-y-8 pt-12 pb-20">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px bg-primary/20 flex-1" />
              <h2 className="text-lg font-mono font-bold text-primary/80 uppercase tracking-widest whitespace-nowrap">
                Offline Coordination
              </h2>
              <div className="h-px bg-primary/20 flex-1" />
            </div>

            <CyberCard className="bg-primary/5 border-primary/20 backdrop-blur-md">
              <CyberCardContent className="p-8 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-2">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-mono text-foreground uppercase tracking-tight">
                    Talk First, Select Later
                  </h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg">
                    Team selection is <span className="text-foreground font-semibold">not a random process</span>. 
                    Reach a definite conclusion with your potential teammates <span className="text-primary/90 font-medium italic">offline</span> before entering any data.
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-white/5 max-w-xl mx-auto">
                  <p className="text-sm text-muted-foreground font-mono">
                    "Coordinate with your sequence colleagues, verify their willingness, and only then proceed to formalize the choice."
                  </p>
                </div>
                <div className="pt-4">
                  <Link to="/login">
                    <CyberButton size="xl" className="px-16 shadow-[0_0_20px_rgba(var(--primary),0.15)]">
                      Proceed to Identity Verification
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </CyberButton>
                  </Link>
                </div>
              </CyberCardContent>
            </CyberCard>
          </section>
          {/* HOW IT WORKS */}
          <section className="space-y-8 pt-12">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px bg-primary/20 flex-1" />
              <h2 className="text-lg font-mono font-bold text-primary/80 uppercase tracking-widest whitespace-nowrap">
                Operational Framework
              </h2>
              <div className="h-px bg-primary/20 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CyberCard className="backdrop-blur-md bg-card/60 border-white/5">
                <CyberCardHeader>
                  <CyberCardTitle className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-primary" />
                    1. View Classmates
                  </CyberCardTitle>
                </CyberCardHeader>
                <CyberCardContent className="text-sm text-muted-foreground leading-relaxed">
                  Browse verified profiles of students in your sequence. Access is strictly restricted to your specific batch.
                </CyberCardContent>
              </CyberCard>

              <CyberCard className="backdrop-blur-md bg-card/60 border-white/5">
                <CyberCardHeader>
                  <CyberCardTitle className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    2. Select Preferences
                  </CyberCardTitle>
                </CyberCardHeader>
                <CyberCardContent className="text-sm text-muted-foreground leading-relaxed">
                  Nominate up to two preferred teammates. Your selections remain encrypted and private until a match is detected.
                </CyberCardContent>
              </CyberCard>

              <CyberCard className="backdrop-blur-md bg-card/60 border-white/5">
                <CyberCardHeader>
                  <CyberCardTitle className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                    3. Mutual Consensus
                  </CyberCardTitle>
                </CyberCardHeader>
                <CyberCardContent className="text-sm text-muted-foreground space-y-3">
                  <p>A team forms ONLY when three students reach a <span className="text-primary/90 font-bold underline decoration-primary/30 underline-offset-4">perfect match</span>:</p>
                  <ul className="space-y-2 ml-1 font-mono text-[13px]">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Student A selects <b className="text-foreground">B & C</b></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Student B selects <b className="text-foreground">A & C</b></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Student C selects <b className="text-foreground">A & B</b></span>
                    </li>
                  </ul>
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[11px] leading-tight text-primary/60">
                      If even one selection is missing or different, the team will not form.
                    </p>
                  </div>
                </CyberCardContent>
              </CyberCard>

              <CyberCard className="backdrop-blur-md bg-card/60 border-white/5">
                <CyberCardHeader>
                  <CyberCardTitle className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-primary" />
                    4. Auto-Finalization
                  </CyberCardTitle>
                </CyberCardHeader>
                <CyberCardContent className="text-sm text-muted-foreground leading-relaxed">
                  Once consensus is reached, the system locks the team automatically. No further modifications are permitted.
                </CyberCardContent>
              </CyberCard>
            </div>
          </section>

          {/* WARNINGS & RULES */}
          <section className="pt-8">
            <CyberCard variant="glow" className="bg-secondary/40 border-primary/10 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <img src={GROUPIFY_LOGO} alt="" className="w-24 h-24 object-contain" />
              </div>
              <CyberCardContent className="p-8 space-y-6">
                <h3 className="flex items-center gap-2 text-warning font-bold font-mono tracking-tighter">
                  <img src={GROUPIFY_LOGO} alt="" className="w-5 h-5 object-contain" />
                  CRITICAL CONSTRAINTS
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground/80">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                    Teams cannot be formed without 100% mutual selection from all members.
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                    Selection attempts are limited. Users with 0 attempts remaining will be locked.
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                    Pending selections do not guarantee team formation.
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                    System data is immutable once a team is finalized by the engine.
                  </li>
                </ul>
              </CyberCardContent>
            </CyberCard>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
