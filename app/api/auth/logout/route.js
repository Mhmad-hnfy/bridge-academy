import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get("fahem_session")?.value;
    let bodyToken = null;
    try {
      const body = await request.json();
      bodyToken = body?.sessionToken;
    } catch (_) {}

    const tokenToDelete = bodyToken || sessionCookie;
    if (tokenToDelete) {
      await supabase.from("user_sessions").delete().eq("session_token", tokenToDelete);
    }
  } catch (err) {
    console.error("Logout session clean error:", err);
  }

  const response = NextResponse.json({ success: true });

  // Clear role cookie
  response.cookies.set("fahem_role", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  // Clear session cookie
  response.cookies.set("fahem_session", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
