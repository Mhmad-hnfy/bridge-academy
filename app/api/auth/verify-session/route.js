import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

export async function POST(request) {
  try {
    const { sessionToken, userId } = await request.json();

    if (!sessionToken || !userId) {
      return NextResponse.json({ valid: true });
    }

    const { data: session, error } = await supabase
      .from("user_sessions")
      .select("id")
      .eq("session_token", sessionToken)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      // If table doesn't exist yet or connection issue, don't kick user out
      return NextResponse.json({ valid: true });
    }

    if (!session) {
      // Session has been terminated (either by a newer device or by admin)
      return NextResponse.json({
        valid: false,
        message: "تم تسجيل الخروج لأن الحساب تم فتحه من جهاز آخر.",
      });
    }

    // Refresh last active timestamp asynchronously
    supabase
      .from("user_sessions")
      .update({ last_active: new Date().toISOString() })
      .eq("id", session.id)
      .then();

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("verify-session error:", err);
    return NextResponse.json({ valid: true });
  }
}
