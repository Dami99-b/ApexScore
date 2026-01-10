import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // PKCE flow (?code=...)
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            navigate("/auth?error=callback_failed", { replace: true });
            return;
          }
        } else if (typeof window !== "undefined" && window.location.hash) {
          // Implicit flow (#access_token=...&refresh_token=...)
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const access_token = hashParams.get("access_token");
          const refresh_token = hashParams.get("refresh_token");

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) {
              navigate("/auth?error=callback_failed", { replace: true });
              return;
            }
          }
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          navigate("/auth?error=callback_failed", { replace: true });
          return;
        }

        // Always clean the callback URL (remove ?code=... and/or #access_token=...)
        if (typeof window !== "undefined") {
          window.history.replaceState({}, document.title, "/auth/callback");
        }

        if (data.session) {
          navigate("/home", { replace: true });
        } else {
          navigate("/auth", { replace: true });
        }
      } catch {
        navigate("/auth?error=callback_failed", { replace: true });
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <>
      <Helmet>
        <title>Signing in… - ApexScore</title>
        <meta name="description" content="Completing your sign-in to ApexScore." />
        <link rel="canonical" href={`${window.location.origin}/auth/callback`} />
      </Helmet>
      <main className="min-h-screen flex items-center justify-center bg-background">
        <section className="text-center space-y-4" aria-label="Signing in">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Completing sign in…</p>
        </section>
      </main>
    </>
  );
};

export default AuthCallback;
