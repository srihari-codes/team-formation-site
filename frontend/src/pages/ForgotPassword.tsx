import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";
import { CyberInput } from "@/components/ui/cyber-input";
import {
  CyberCard,
  CyberCardContent,
  CyberCardHeader,
  CyberCardTitle,
} from "@/components/ui/cyber-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SplineBackground } from "@/components/SplineBackground";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: string;
    message: string;
    class: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Create form data for x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append("txt_Email", email);
      params.append("iden", "1");

      const response = await fetch(
        `${API_BASE_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      // The API returns JSON
      const data = await response.json();

      if (data.resultstatus === "1") {
        setResult({
          status: "success",
          message: data.resultmsg,
          class: data.resultclass,
        });
        toast.success("Password reset email sent successfully");
      } else {
        setResult({
          status: "error",
          message: data.result || "Failed to send email. Please check the email address.",
          class: data.resultclass,
        });
        toast.error("Failed to reset password");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setResult({
        status: "error",
        message: "Network error. Please try again later or contact support if the issue persists.",
        class: "ui-state-error",
      });
      toast.error("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-pattern relative">
      <SplineBackground
        sceneUrl="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
        className="opacity-20"
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary/30 cyber-glow">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-mono text-xl font-bold tracking-wide">
              CONSENSUS PROTOCOL
            </h1>
            <p className="text-sm text-muted-foreground">
              Password Recovery Sequence
            </p>
          </div>

          <CyberCard variant="glow">
            <CyberCardHeader>
              <CyberCardTitle>FORGOT PASSWORD</CyberCardTitle>
            </CyberCardHeader>
            <CyberCardContent>
              {!result || result.status === "error" ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your registered email address to receive password reset instructions.
                  </p>

                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground z-10" />
                    <CyberInput
                      placeholder="example@email.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="pl-10"
                      required
                    />
                  </div>

                  {result && result.status === "error" && (
                    <div className="p-4 rounded-lg bg-destructive/15 border border-destructive/40 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[11px] font-mono font-bold text-destructive uppercase tracking-widest leading-none">
                          Error
                        </p>
                        <p className="text-xs font-mono text-destructive leading-normal font-semibold">
                          {result.message}
                        </p>
                      </div>
                    </div>
                  )}

                  <CyberButton
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? <LoadingSpinner size="sm" /> : "Send Reset Link"}
                  </CyberButton>
                </form>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mb-2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Email Sent</h3>
                    
                    <div 
                      className="text-sm text-foreground bg-muted/30 p-4 rounded-md border border-border/50 text-left w-full overflow-x-auto [&_table]:w-full [&_td]:pb-2 [&_td:first-child]:font-semibold [&_td:first-child]:text-primary [&_td:nth-child(2)]:px-2"
                      dangerouslySetInnerHTML={{ __html: result.message }}
                    />
                  </div>
                  
                  <Link to="/login" className="w-full block">
                    <CyberButton className="w-full">
                      Go to Login
                    </CyberButton>
                  </Link>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-border/40">
                <Link to="/login" className="block">
                  <CyberButton
                    variant="ghost"
                    className="w-full"
                    type="button"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </CyberButton>
                </Link>
              </div>
            </CyberCardContent>
          </CyberCard>
        </div>
      </div>
    </div>
  );
}
