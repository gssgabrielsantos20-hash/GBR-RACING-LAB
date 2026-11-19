// GBR Racing Lab — exclusão definitiva da própria conta (ADR 0024).
// Contrato com cloud.js: POST {password, confirmation} → 200 {deleted:true}
// ou erro {code}; 409 LAST_ADMIN quando o usuário é o único administrador.
// Segurança: o usuário vem do JWT validado (nunca do corpo); a senha é
// reconferida; só a própria conta pode ser apagada; nenhum dado pessoal em log.
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const CONFIRMATION = "EXCLUIR MINHA CONTA";
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)?gbr-racing-lab\.pages\.dev$/;

function cors(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGIN.test(origin) ? origin : "https://gbr-racing-lab.pages.dev";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function reply(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function serviceKey(): string | null {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    return keys.default ?? Object.values(keys)[0] ?? null;
  } catch { return null; }
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return reply(405, { code: "METHOD_NOT_ALLOWED" }, origin);
  if (origin && !ALLOWED_ORIGIN.test(origin)) return reply(403, { code: "ORIGIN_NOT_ALLOWED" }, origin);

  const url = Deno.env.get("SUPABASE_URL");
  const secret = serviceKey();
  const publicKey = Deno.env.get("SUPABASE_ANON_KEY") ?? req.headers.get("apikey");
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!url || !secret || !publicKey) return reply(500, { code: "MISCONFIGURED" }, origin);
  if (!jwt) return reply(401, { code: "UNAUTHENTICATED" }, origin);

  let body: { password?: unknown; confirmation?: unknown };
  try { body = await req.json(); } catch { return reply(400, { code: "INVALID_BODY" }, origin); }
  const password = typeof body.password === "string" ? body.password : "";
  if (body.confirmation !== CONFIRMATION || password.length < 1 || password.length > 128) {
    return reply(400, { code: "INVALID_CONFIRMATION" }, origin);
  }

  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

  // 1. Quem é o usuário: somente pelo token validado no servidor.
  const { data: who, error: whoError } = await admin.auth.getUser(jwt);
  const user = who?.user;
  if (whoError || !user?.id || !user.email) return reply(401, { code: "UNAUTHENTICATED" }, origin);

  // 2. Reconfirma a senha (cliente isolado, sem persistir sessão).
  const check = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: signed, error: pwError } = await check.auth.signInWithPassword({ email: user.email, password });
  if (pwError || signed?.user?.id !== user.id) return reply(403, { code: "INVALID_PASSWORD" }, origin);

  // 3. Não deixa a academia sem administrador.
  const { data: adminRow } = await admin.from("academy_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (adminRow) {
    const { count } = await admin.from("academy_admins").select("user_id", { count: "exact", head: true });
    if ((count ?? 0) <= 1) return reply(409, { code: "LAST_ADMIN" }, origin);
  }

  // 4. Exclusão definitiva; garagem, perfil e matrícula saem por ON DELETE CASCADE.
  const { error: delError } = await admin.auth.admin.deleteUser(user.id, false);
  if (delError) {
    console.error("delete-account: falha na exclusão", delError.status ?? "", delError.code ?? "");
    return reply(409, { code: "DELETE_BLOCKED" }, origin);
  }
  return reply(200, { deleted: true }, origin);
});
