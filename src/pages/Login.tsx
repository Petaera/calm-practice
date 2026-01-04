import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { updateTherapist } from "@/services/therapist.service";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    fullName: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    practiceName: "",
    specialization: "",
    termsAgreed: false,
    privacyAgreed: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(loginData.email, loginData.password);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Login error:", err);
      setError(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Validate terms and privacy agreement
    if (!signupData.termsAgreed) {
      setError("You must agree to the Terms of Service to create an account");
      return;
    }

    if (!signupData.privacyAgreed) {
      setError("You must agree to the Privacy Policy to create an account");
      return;
    }

    setIsLoading(true);

    try {
      // Create auth user (trigger will auto-create therapist profile and settings)
      const redirectUrl = `${window.location.origin}/auth/verify`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.fullName,
            practice_name: signupData.practiceName || null,
            specialization: signupData.specialization || null,
            terms_agreed: signupData.termsAgreed,
            privacy_agreed: signupData.privacyAgreed,
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Update therapist record with terms and privacy agreement
      // The trigger creates the therapist record, so we update it after
      // Use user ID to match (therapist.id should match auth.users.id)
      let retries = 5;
      let updateSuccess = false;
      
      while (retries > 0 && !updateSuccess) {
        // Wait a bit for the trigger to complete
        if (retries < 5) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // First check if therapist record exists
        // Use maybeSingle() instead of single() to avoid error when record doesn't exist
        const { data: existingTherapist, error: checkError } = await supabase
          .from("therapists")
          .select("id, terms_agreed, privacy_agreed")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (checkError) {
          // Any error other than "not found" is a real issue
          console.warn(`Retry ${6 - retries}/5: Error checking therapist record:`, checkError);
          retries--;
          continue;
        }

        if (!existingTherapist) {
          // Therapist record doesn't exist yet, wait and retry
          console.log(`Retry ${6 - retries}/5: Therapist record not found yet, waiting...`);
          retries--;
          continue;
        }

        // Therapist record exists, now update it
        // Explicitly convert to boolean to ensure true/false values
        const result = await updateTherapist(authData.user.id, {
          terms_agreed: Boolean(signupData.termsAgreed),
          privacy_agreed: Boolean(signupData.privacyAgreed),
        });

        if (!result.error && result.data) {
          updateSuccess = true;
          console.log("Successfully updated therapist agreement:", {
            terms_agreed: result.data.terms_agreed,
            privacy_agreed: result.data.privacy_agreed,
          });
          break;
        }
        
        if (result.error) {
          console.warn(`Retry ${6 - retries}/5: Error updating therapist agreement:`, result.error);
        }
        
        retries--;
      }

      if (!updateSuccess) {
        console.error("Failed to update therapist agreement after all retries. User ID:", authData.user.id);
        // Still show success to user, but log the error for debugging
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      // If email confirmation is disabled, sign in automatically
      if (authData.session) {
        navigate("/dashboard");
      } else {
        // Switch to login tab
        setError("Please check your email to verify your account, then sign in.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!forgotPasswordEmail) {
      setError("Please enter your email address");
      return;
    }

    setIsSendingReset(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        forgotPasswordEmail,
        {
          redirectTo: redirectUrl,
        }
      );

      if (resetError) throw resetError;

      setResetEmailSent(true);
      toast({
        title: "Reset email sent!",
        description: "Please check your email for password reset instructions.",
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Forgot password error:", err);
      setError(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordEmail("");
    setResetEmailSent(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
              Welcome to PracMind
            </h1>
            <p className="text-muted-foreground text-lg">
              Your intelligent workspace for managing your practice
            </p>
          </div>

          <Card className="shadow-2xl border-border/50">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-display text-center">
                Get Started
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="font-medium">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="font-medium">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({ ...loginData, password: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span className="text-muted-foreground">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name *</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Dr. Sarah Johnson"
                        value={signupData.fullName}
                        onChange={(e) =>
                          setSignupData({ ...signupData, fullName: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({ ...signupData, email: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-practice">Practice Name (Optional)</Label>
                      <Input
                        id="signup-practice"
                        type="text"
                        placeholder="Your Practice Name"
                        value={signupData.practiceName}
                        onChange={(e) =>
                          setSignupData({ ...signupData, practiceName: e.target.value })
                        }
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-specialization">Specialization (Optional)</Label>
                      <Input
                        id="signup-specialization"
                        type="text"
                        placeholder="e.g., CBT, Family Therapy"
                        value={signupData.specialization}
                        onChange={(e) =>
                          setSignupData({ ...signupData, specialization: e.target.value })
                        }
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({ ...signupData, password: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={signupData.confirmPassword}
                        onChange={(e) =>
                          setSignupData({ ...signupData, confirmPassword: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="terms-agreed"
                          checked={signupData.termsAgreed}
                          onChange={(e) =>
                            setSignupData({ ...signupData, termsAgreed: e.target.checked })
                          }
                          required
                          className="mt-1 rounded border-border"
                          disabled={isLoading}
                        />
                        <label htmlFor="terms-agreed" className="text-sm text-muted-foreground cursor-pointer">
                          I agree to the{" "}
                          <a href="/terms" target="_blank" className="text-primary hover:underline">
                            Terms of Service
                          </a>
                        </label>
                      </div>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="privacy-agreed"
                          checked={signupData.privacyAgreed}
                          onChange={(e) =>
                            setSignupData({ ...signupData, privacyAgreed: e.target.checked })
                          }
                          required
                          className="mt-1 rounded border-border"
                          disabled={isLoading}
                        />
                        <label htmlFor="privacy-agreed" className="text-sm text-muted-foreground cursor-pointer">
                          I agree to the{" "}
                          <a href="/privacy" target="_blank" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base"
                      size="lg"
                      disabled={isLoading || !signupData.termsAgreed || !signupData.privacyAgreed}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <Link to="/" className="text-primary hover:underline">
                  ← Back to home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={handleCloseForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {resetEmailSent
                ? "We've sent you an email with instructions to reset your password."
                : "Enter your email address and we'll send you a link to reset your password."}
            </DialogDescription>
          </DialogHeader>
          {!resetEmailSent ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  disabled={isSendingReset}
                  className="h-11"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForgotPassword}
                  disabled={isSendingReset}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSendingReset}>
                  {isSendingReset ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <DialogFooter>
              <Button onClick={handleCloseForgotPassword} className="w-full">
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
