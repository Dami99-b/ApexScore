import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock, User, Building, Briefcase, ArrowLeft, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signIn, signUp, updateProfile } = useAuth();
  
  const mode = searchParams.get("mode");
  const isSignup = mode === "signup";
  const isSecurityRecover = mode === "security-recover";
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Security-question recovery
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityNewPassword, setSecurityNewPassword] = useState("");
  const [securityConfirmPassword, setSecurityConfirmPassword] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    institution: "",
    department: "",
    position: "",
  });

  // Redirect if already logged in (but allow security-question recovery to render)
  useEffect(() => {
    if (!authLoading && user && !isSecurityRecover) {
      navigate("/home", { replace: true });
    }
  }, [user, authLoading, isSecurityRecover, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignup && step === 1) {
        // Validate passwords
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }
        setStep(2);
        setIsLoading(false);
        return;
      }

      if (isSignup && step === 2) {
        // Sign up with Supabase
        const { error } = await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          last_name: formData.lastName
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        // Update profile with additional details
        setTimeout(async () => {
          await updateProfile({
            institution: formData.institution,
            department: formData.department,
            position: formData.position,
          });
        }, 1000);

        toast.success("Account created successfully!");
        navigate("/home");
        return;
      }

      // Sign in
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
        setIsLoading(false);
        return;
      }

      toast.success("Signed in successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  const handleSecurityQuestionLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = formData.email.trim();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("security-password-recovery", {
        body: { action: "get_question", email },
      });

      if (error) {
        toast.error(error.message || "Failed to load security question");
        return;
      }

      if (!data?.question) {
        toast.error("No security question found for this account.");
        return;
      }

      setSecurityQuestion(data.question as string);
    } catch {
      toast.error("Failed to load security question");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!securityQuestion) {
      toast.error("Please load your security question first");
      return;
    }

    if (securityNewPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (securityNewPassword !== securityConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("security-password-recovery", {
        body: {
          action: "reset_password",
          email: formData.email,
          answer: securityAnswer,
          newPassword: securityNewPassword,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
        return;
      }

      if (!data?.ok) {
        toast.error("Failed to reset password");
        return;
      }

      toast.success("Password updated. You can sign in now.");
      navigate("/auth");
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {(isSignup ? "Sign Up" : isSecurityRecover ? "Recover Password" : "Sign In")} - ApexScore
        </title>
        <meta
          name="description"
          content={
            isSignup
              ? "Create your ApexScore account"
              : isSecurityRecover
                ? "Recover your ApexScore password using your security question"
                : "Sign in to your ApexScore account"
          }
        />
      </Helmet>
      
      <div className="min-h-screen bg-background flex">
        {/* Left panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-secondary/30">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col justify-center p-12">
            <Link to="/" className="flex items-center gap-2 mb-12">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-2xl text-foreground">
                Apex<span className="gradient-text">Score</span>
              </span>
            </Link>

            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              Secure Your Lending Decisions
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Join leading financial institutions using AI-powered risk assessment 
              to make smarter, faster loan decisions.
            </p>

            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">✓</span>
                </div>
                <span>Real-time identity verification</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">✓</span>
                </div>
                <span>AI-powered risk scoring</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">✓</span>
                </div>
                <span>Comprehensive loan history analysis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Auth form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors lg:hidden">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Apex<span className="gradient-text">Score</span>
              </span>
            </div>

            <div className="glass-card p-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {isSecurityRecover
                  ? "Recover Password"
                  : isSignup
                    ? step === 1
                      ? "Create Account"
                      : "Complete Profile"
                    : "Welcome Back"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isSecurityRecover
                  ? "Answer your security question to set a new password"
                  : isSignup
                    ? step === 1
                      ? "Start your free trial today"
                      : "Tell us about yourself"
                    : "Sign in to access your dashboard"}
              </p>

              {/* Password Recovery Flows */}
              {isSecurityRecover ? (
                !securityQuestion ? (
                  <form onSubmit={handleSecurityQuestionLookup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@company.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Continue
                    </Button>

                    <Link to="/auth" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                      Back to Sign In
                    </Link>
                  </form>
                ) : (
                  <form onSubmit={handleSecurityPasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Security Question</Label>
                      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                        {securityQuestion}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="securityAnswer">Your Answer</Label>
                      <Input
                        id="securityAnswer"
                        type="text"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="securityNewPassword">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="securityNewPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={securityNewPassword}
                          onChange={(e) => setSecurityNewPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="securityConfirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="securityConfirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={securityConfirmPassword}
                          onChange={(e) => setSecurityConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Update Password
                    </Button>

                    <button
                      type="button"
                      className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setSecurityQuestion(null)}
                    >
                      Use a different email
                    </button>
                  </form>
                )
              ) : (
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isSignup && step === 2 ? (
                    // Profile details step
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              id="firstName"
                              name="firstName"
                              placeholder="John"
                              className="pl-10"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName"
                            name="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="institution">Financial Institution</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="institution"
                            name="institution"
                            placeholder="e.g., First National Bank"
                            className="pl-10"
                            value={formData.institution}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="department"
                            name="department"
                            placeholder="e.g., Credit Risk"
                            className="pl-10"
                            value={formData.department}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Position / Role</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="position"
                            name="position"
                            placeholder="e.g., Loan Officer"
                            className="pl-10"
                            value={formData.position}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </Button>
                        <Button type="submit" variant="hero" className="flex-1" disabled={isLoading}>
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Create Account
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Email/password step
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@company.com"
                            className="pl-10"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          {!isSignup && (
                            <Link to="/auth?mode=security-recover" className="text-xs text-primary hover:underline">
                              Forgot password?
                            </Link>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      {isSignup && (
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      )}

                      <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isSignup ? "Continue" : "Sign In"}
                      </Button>

                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-full justify-center gap-3 bg-card"
                        size="lg"
                        onClick={async () => {
                          setIsLoading(true);
                          const { error } = await supabase.auth.signInWithOAuth({
                            provider: "google",
                            options: {
                              redirectTo: `${window.location.origin}/auth/callback`,
                            },
                          });

                          if (error) {
                            const msg = error.message || "Failed to start Google sign-in";
                            if (msg.toLowerCase().includes("unsupported provider")) {
                              toast.error("Google sign-in isn’t enabled in the backend yet. Enable the Google provider in the backend auth settings, then try again.");
                            } else {
                              toast.error(msg);
                            }
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                      >
                        {/* Multicolor Google mark */}
                        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.2 1.54 7.62 2.83l5.54-5.54C33.69 3.61 29.33 1.5 24 1.5 14.84 1.5 6.96 6.74 3.16 14.43l6.68 5.19C11.52 13.41 17.3 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.5 24.5c0-1.61-.14-2.78-.43-3.99H24v7.56h13.15c-.27 2.04-1.74 5.11-4.99 7.18l6.1 4.72C42.35 35.19 46.5 30.54 46.5 24.5z"/>
                          <path fill="#FBBC05" d="M9.84 28.38A14.7 14.7 0 0 1 9 24c0-1.52.27-2.98.84-4.38l-6.68-5.19A23.9 23.9 0 0 0 1.5 24c0 3.83.92 7.44 2.66 10.57l5.68-6.19z"/>
                          <path fill="#34A853" d="M24 46.5c5.33 0 9.82-1.76 13.09-4.78l-6.1-4.72c-1.63 1.14-3.82 1.93-6.99 1.93-6.7 0-12.48-3.91-14.16-10.12l-6.68 5.19C6.96 41.26 14.84 46.5 24 46.5z"/>
                        </svg>
                        Continue with Google
                      </Button>

                    </>
                  )}
                </form>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                {isSignup ? (
                  <>
                    Already have an account?{" "}
                    <Link to="/auth" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <Link to="/auth?mode=signup" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
