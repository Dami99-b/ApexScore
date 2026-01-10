// Lovable Cloud function: security-password-recovery
// Allows password recovery using a security question + answer stored in the profiles table.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RequestBody =
  | { action: "get_question"; email: string }
  | { action: "reset_password"; email: string; answer: string; newPassword: string };

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Server is not configured for password recovery." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const body = (await req.json()) as RequestBody;

    const email = ("email" in body ? body.email : "").trim().toLowerCase();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("user_id, security_question, security_answer, email, work_email")
      .or(`email.eq.${email},work_email.eq.${email}`)
      .maybeSingle();

    if (profileError) {
      return new Response(JSON.stringify({ error: "Failed to fetch recovery details." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!profile?.user_id || !profile?.security_question || !profile?.security_answer) {
      // Avoid leaking which emails exist; return a neutral response.
      return new Response(JSON.stringify({ question: null }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (body.action === "get_question") {
      return new Response(JSON.stringify({ question: profile.security_question }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // reset_password
    const answer = body.answer.trim();
    const newPassword = body.newPassword;

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const expected = profile.security_answer.trim().toLowerCase();
    const received = answer.trim().toLowerCase();

    if (!received || received !== expected) {
      return new Response(JSON.stringify({ error: "Incorrect security answer." }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { error: adminError } = await admin.auth.admin.updateUserById(profile.user_id, {
      password: newPassword,
    });

    if (adminError) {
      return new Response(JSON.stringify({ error: "Failed to update password." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Unexpected error." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
