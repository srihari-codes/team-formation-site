import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, RefreshCw, AlertCircle, AlertTriangle } from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";
import { CyberInput } from "@/components/ui/cyber-input";
import { CyberCard, CyberCardContent, CyberCardHeader, CyberCardTitle } from "@/components/ui/cyber-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SplineBackground } from "@/components/SplineBackground";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

type AuthStep = "credentials" | "otp";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState<AuthStep>("credentials");
  const [sessionId, setSessionId] = useState<string>("");
  const [tempToken, setTempToken] = useState<string>("");
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [otp, setOtp] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/me");
    }
  }, [isAuthenticated, navigate]);

  const fetchSession = useCallback(async () => {
    setCaptchaLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/get-session`);
      const data = await res.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        setCaptchaKey(prev => prev + 1);
      } else {
        setError("Failed to initialize session");
      }
    } catch {
      setError("Server unavailable. Try again later.");
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !captcha) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        session_id: sessionId,
        username,
        password,
        captcha,
      });
      
      const res = await fetch(`${API_BASE_URL}/get-otp?${params}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        await fetchSession();
      } else if (!data.human) {
        const msg = "CAPTCHA ERROR: Verification failed. Please enter the correct characters from the image.";
        setError(msg);
        toast.error(msg);
        setCaptcha("");
        await fetchSession();
      } else if (!data.credential) {
        const msg = "CREDENTIAL ERROR: Unauthorized access. The Roll Number or Password provided is incorrect.";
        setError(msg);
        toast.error(msg, {
          duration: 5000,
        });
        await fetchSession();
      } else if (data.success === false) {
        const msg = "UNEXPECTED ERROR: The server encountered an issue while processing your request.";
        setError(msg);
        toast.error(msg);
        await fetchSession();
      } else if (data.success && data.temp_token) {
        setTempToken(data.temp_token);
        setStep("otp");
        toast.success("Identity verified. Please enter the OTP sent to your device.");
      } else {
        const msg = "UNEXPECTED ERROR: Failed to proceed to the next step.";
        setError(msg);
        toast.error(msg);
        await fetchSession();
      }
    } catch {
      setError("Connection failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 7) {
      setError("Enter 7-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        session_id: sessionId,
        otp,
        temp_token: tempToken,
      });
      
      const res = await fetch(`${API_BASE_URL}/login?${params}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
      } else if (data.verified === false) {
        const msg = "OTP ERROR: The verification code entered is incorrect. Please try again.";
        setError(msg);
        toast.error(msg);
        setOtp("");
      } else if (data.success === false) {
        const msg = "UNEXPECTED ERROR: Verification processing failed on the server.";
        setError(msg);
        toast.error(msg);
      } else if (data.access_token) {
        login(data.access_token, data.username, data.batch);
        toast.success("Authentication successful. Welcome back.");
        navigate("/me");
      } else {
        const msg = "UNEXPECTED ERROR: Unable to complete authentication.";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      setError("Connection failed. Try again.");
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
        <div className="w-full max-w-sm space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary/30 cyber-glow">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-mono text-xl font-bold tracking-wide">
              CONSENSUS PROTOCOL
            </h1>
            <p className="text-sm text-muted-foreground">
              Secure Team Formation System
            </p>
          </div>

          <CyberCard variant="glow">
            <CyberCardHeader>
              <CyberCardTitle>
                {step === "credentials" ? "AUTHENTICATE" : "VERIFY OTP"}
              </CyberCardTitle>
            </CyberCardHeader>
            <CyberCardContent>
              {step === "credentials" ? (
                <form onSubmit={handleSubmitCredentials} className="space-y-4">
                  <CyberInput
                    label="Roll Number"
                    placeholder="142223128XXX"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                  />
                  
                  <div className="relative">
                    <CyberInput
                      label="ERP Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-wide text-muted-foreground">
                      Captcha
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-12 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        {captchaLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : sessionId ? (
                          <img
                            key={captchaKey}
                            src={`${API_BASE_URL}/captcha?session_id=${sessionId}`}
                            alt="Captcha"
                            className="h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">Loading...</span>
                        )}
                      </div>
                      <CyberButton
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={fetchSession}
                        disabled={captchaLoading}
                      >
                        <RefreshCw className={`w-4 h-4 ${captchaLoading ? 'animate-spin' : ''}`} />
                      </CyberButton>
                    </div>
                    <CyberInput
                      placeholder="Enter captcha text"
                      value={captcha}
                      onChange={(e) => setCaptcha(e.target.value)}
                      disabled={loading}
                      className="font-mono tracking-widest"
                    />
                  </div>

                  <CyberButton
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading || !sessionId}
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Request OTP"
                    )}
                  </CyberButton>

                  {error && (
                    <div className="mt-4 p-4 rounded-lg bg-destructive/15 border border-destructive/40 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[11px] font-mono font-bold text-destructive uppercase tracking-widest leading-none">
                          System Execution Error
                        </p>
                        <p className="text-xs font-mono text-destructive leading-normal font-semibold">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <form onSubmit={handleSubmitOtp} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    OTP sent to your registered mobile number.
                  </p>
                  
                  <CyberInput
                    label="OTP Code"
                    placeholder="XXXXXXX"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 7))}
                    disabled={loading}
                    className="font-mono tracking-[0.5em] text-center text-lg"
                    maxLength={7}
                  />

                  <CyberButton
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading || otp.length !== 7}
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Verify & Login"
                    )}
                  </CyberButton>

                  {error && (
                    <div className="mt-4 p-4 rounded-lg bg-destructive/15 border border-destructive/40 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[11px] font-mono font-bold text-destructive uppercase tracking-widest leading-none">
                          Validation Failure
                        </p>
                        <p className="text-xs font-mono text-destructive leading-normal font-semibold">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  <CyberButton
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStep("credentials");
                      setOtp("");
                      setError(null);
                      fetchSession();
                    }}
                  >
                    Back to login
                  </CyberButton>
                </form>
              )}
            </CyberCardContent>
          </CyberCard>

          <p className="text-xs text-center text-muted-foreground font-mono">
            Use your ERP credentials to authenticate
          </p>
        </div>
      </div>
    </div>
  );
}
