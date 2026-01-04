import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/landing/Footer";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (!tokenHash || !type) {
        setStatus("error");
        setErrorMessage("Invalid verification link. Missing required parameters.");
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "email" | "signup" | "recovery" | "email_change",
        });

        if (error) {
          setStatus("error");
          setErrorMessage(error.message || "Failed to verify email. The link may have expired.");
        } else {
          setStatus("success");
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setErrorMessage("An unexpected error occurred during verification.");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-border/50">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-display text-center">
                Email Verification
              </CardTitle>
              <CardDescription className="text-center">
                Verifying your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === "verifying" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground text-center">
                    Verifying your email address...
                  </p>
                </div>
              )}

              {status === "success" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Email verified successfully! Redirecting to dashboard...
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}

              {status === "error" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/login")}
                      className="flex-1"
                    >
                      Back to Login
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      className="flex-1"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailVerification;

