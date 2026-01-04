import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Therapist } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  therapist: Therapist | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch therapist data if user exists
      if (session?.user) {
        fetchTherapist(session.user.email!);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Handle password recovery event
      if (event === "PASSWORD_RECOVERY") {
        // User is in password recovery mode
        // The ResetPassword page will handle the actual password update
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        fetchTherapist(session.user.email!);
      } else {
        setTherapist(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTherapist = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("therapists")
        .select("*")
        .eq("email", email)
        .single();

      if (error) throw error;
      setTherapist(data);
    } catch (error) {
      console.error("Error fetching therapist:", error);
      setTherapist(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{ user, therapist, session, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// For development/demo purposes - mock therapist ID (valid UUID format)
// Replace this with actual auth in production or create a test therapist in your DB
export const DEMO_THERAPIST_ID = "00000000-0000-0000-0000-000000000000";

