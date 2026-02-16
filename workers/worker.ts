import { GoogleGenAI } from "@google/genai";

export interface Env {
  OPENAI_API_KEY: string;
  GEMINI_API_KEY: string;
  ALLOWED_ORIGINS?: string;
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
};

const getCorsHeaders = (origin: string | null, env: Env) => {
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const allowOrigin = allowed.length === 0
    ? "*"
    : (origin && allowed.includes(origin) ? origin : allowed[0]);

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, corsHeaders);
    }

    if (url.pathname === "/api/openai/responses") {
      if (!env.OPENAI_API_KEY) {
        return json({ error: "OPENAI_API_KEY not configured" }, 500, corsHeaders);
      }
      const body = await request.json();
      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
      });
      const text = await upstream.text();
      return new Response(text, {
        status: upstream.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    if (url.pathname === "/api/gemini/generateContent") {
      if (!env.GEMINI_API_KEY) {
        return json({ error: "GEMINI_API_KEY not configured" }, 500, corsHeaders);
      }
      const payload = await request.json();
      const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      const response = await genAI.models.generateContent(payload);
      const out = {
        text: response.text,
        candidates: response.candidates || [],
      };
      return json(out, 200, corsHeaders);
    }

    return json({ error: "Not found" }, 404, corsHeaders);
  }
};
