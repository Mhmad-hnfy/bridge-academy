import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyCookieValue } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

export async function POST(request) {
  try {
    // Verify admin role cookie
    const roleCookie = request.cookies.get("fahem_role")?.value;
    const verifiedRole = await verifyCookieValue(roleCookie);

    if (verifiedRole !== "admin") {
      return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: "معرف المستخدم مطلوب" }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_sessions")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error revoking sessions:", error);
      return NextResponse.json({ success: false, message: "حدث خطأ أثناء إنهاء الجلسات" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "تم تسجيل خروج الطالب من جميع الأجهزة بنجاح",
    });
  } catch (err) {
    console.error("revoke-sessions error:", err);
    return NextResponse.json({ success: false, message: "خطأ في الخادم" }, { status: 500 });
  }
}
