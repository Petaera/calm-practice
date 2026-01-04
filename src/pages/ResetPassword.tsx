import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/landing/Footer";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check if we're in password recovery mode
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && mounted) {
        setIsRecoveryMode(true);
      } else if (!session && mounted) {
        // If session is lost and we're not in recovery mode, redirect to login
        if (!isRecoveryMode) {
          navigate("/login");
        }
      }
    });

    // Check current session to see if we're already in recovery mode
    // Also check URL for token_hash in case user came from email link
    const checkRecoveryMode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenHash = urlParams.get("token_hash");
      const type = urlParams.get("type");

      // If we have token_hash and type=recovery, verify it
      if (tokenHash && type === "recovery") {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (!error && mounted) {
            setIsRecoveryMode(true);
            // Clean up URL
            window.history.replaceState({}, document.title, "/reset-password");
          } else if (error && mounted) {
            console.error("Recovery verification error:", error);
            navigate("/login");
          }
        } catch (err) {
          console.error("Error verifying recovery token:", err);
          if (mounted) {
            navigate("/login");
          }
        }
      } else {
        // Check if we have a session (might already be in recovery mode)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && mounted) {
          navigate("/login");
        } else if (session && mounted) {
          // Check if user metadata indicates recovery mode
          // If session exists, we might be in recovery mode
          setIsRecoveryMode(true);
        }
      }
    };

    checkRecoveryMode();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      toast({
        title: "Password updated!",
        description: "Your password has been successfully reset.",
      });

      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Password reset error:", err);
      setError(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isRecoveryMode) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 flex items-center justify-center py-24 px-6">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-border/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground text-center">
                    Loading password reset form...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
              Reset Your Password
            </h1>
            <p className="text-muted-foreground text-lg">
              Enter your new password below
            </p>
          </div>

          <Card className="shadow-2xl border-border/50">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-display text-center">
                New Password
              </CardTitle>
              <CardDescription className="text-center">
                Choose a strong password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                    minLength={6}
                  />
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
                      Resetting password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <button
                  onClick={() => navigate("/login")}
                  className="text-primary hover:underline"
                >
                  ← Back to login
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;

