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
import {
  Users,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground grid-pattern relative overflow-hidden">
      <SplineBackground 
        sceneUrl="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" 
        className="opacity-20 pointer-events-none"
      />

      {/* TOP HEADER - IMMEDIATE ACCESS */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm font-bold tracking-tighter">CONSENSUS</span>
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
              <div className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] md:text-xs font-mono mb-4 backdrop-blur-sm animate-pulse">
                SYSTEM STATUS: ACTIVE // BATCH ISOLATION ENABLED
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground cyber-text-glow leading-tight font-mono">
                Team Formation<br/><span className="text-primary/90">Protocol V2.0</span>
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
                <CyberCardContent className="text-sm text-muted-foreground leading-relaxed">
                  A team forms ONLY if Student A selects B & C, Student B selects A & C, and Student C selects A & B perfectly.
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
                <ShieldAlert className="w-24 h-24" />
              </div>
              <CyberCardContent className="p-8 space-y-6">
                <h3 className="flex items-center gap-2 text-warning font-bold font-mono tracking-tighter">
                  <ShieldAlert className="w-5 h-5" />
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

          {/* USER ACKNOWLEDGEMENT & FINAL CTA */}
          <section className="space-y-12 pt-12 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-4 text-sm text-muted-foreground backdrop-blur-sm p-4 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <span>I understand teams form only by mutual selection.</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground backdrop-blur-sm p-4 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <span>I understand my edits are limited.</span>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs font-mono text-muted-foreground mb-6 uppercase tracking-widest">
                Ready to Proceed?
              </p>
              <Link to="/login">
                <CyberButton size="lg" variant="default" className="px-16">
                  LOGIN TO ACCESS
                </CyberButton>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
