import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GITHUB_CLIENT_ID = Deno.env.get("EXPO_PUBLIC_GITHUB_CLIENT_ID") || "";
const GITHUB_CLIENT_SECRET = Deno.env.get("EXPO_PUBLIC_GITHUB_CLIENT_SECRET") || "";

const log = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logData = data ? ` | Data: ${JSON.stringify(data)}` : "";
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}${logData}`);
};

log("info", "Function initialized", {
  GITHUB_CLIENT_ID_SET: !!GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET_SET: !!GITHUB_CLIENT_SECRET,
});

serve(async (req) => {
  const requestId = crypto.randomUUID();
  log("info", `Request received`, { requestId, method: req.method });

  try {
    const headers = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Invalid HTTP method" }), {
        status: 405,
        headers,
      });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return new Response(JSON.stringify({ error: "Missing authorization code" }), {
        status: 400,
        headers,
      });
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return new Response(JSON.stringify({ error: tokenData.error }), {
        status: 400,
        headers,
      });
    }

    return new Response(JSON.stringify({ access_token: tokenData.access_token }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Unexpected error occurred", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
