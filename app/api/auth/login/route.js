import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { signCookieValue } from "@/lib/auth";

// Server-side Supabase client — password field is ONLY read here, never sent to client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

// Helper: snake_case → camelCase
const toCamel = (obj) => {
  if (!obj) return obj;
  const newObj = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, message: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    // Fetch user WITH password — server-side only, never exposed to client
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.status === "محظور" || user.status === "موقوف") {
      return NextResponse.json(
        { success: false, message: "هذا الحساب موقوف. تواصل مع الإدارة." },
        { status: 403 }
      );
    }

    // Compare password — supports bcrypt hash AND legacy plaintext (auto-upgrades)
    let passwordMatch = false;
    const isHashed = user.password && user.password.startsWith("$2");

    if (isHashed) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plaintext comparison (migration period)
      passwordMatch = user.password === password;
      if (passwordMatch) {
        // Auto-upgrade plaintext password to bcrypt hash
        const hashed = await bcrypt.hash(password, 12);
        await supabase.from("users").update({ password: hashed }).eq("id", user.id);
      }
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    // Strip password from response — NEVER send to client
    const { password: _pwd, ...safeUser } = user;
    const camelUser = toCamel(safeUser);
    camelUser.maxDevices = user.max_devices || 1;

    // Device session tracking & limit enforcement
    const userAgent = request.headers.get("user-agent") || "";
    const ipAddress = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "127.0.0.1";
    const sessionToken = crypto.randomUUID();

    try {
      if (user.role !== "admin") {
        const maxAllowed = parseInt(user.max_devices) || 1;
        const { data: existingSessions, error: sessErr } = await supabase
          .from("user_sessions")
          .select("id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (!sessErr && existingSessions && existingSessions.length >= maxAllowed) {
          // Calculate number of older sessions to invalidate
          const kickCount = existingSessions.length - maxAllowed + 1;
          const idsToKick = existingSessions.slice(0, kickCount).map((s) => s.id);
          if (idsToKick.length > 0) {
            await supabase.from("user_sessions").delete().in("id", idsToKick);
          }
        }
      }

      // Record the new session
      const { parseDeviceInfo } = await import("@/lib/deviceDetector");
      const deviceName = parseDeviceInfo(userAgent);

      await supabase.from("user_sessions").insert({
        user_id: user.id,
        session_token: sessionToken,
        device_name: deviceName,
        user_agent: userAgent.slice(0, 500),
        ip_address: ipAddress,
        last_active: new Date().toISOString(),
      });
    } catch (sessionError) {
      console.warn("User sessions tracking warning (table may not exist yet):", sessionError.message || sessionError);
    }

    // Sign the role value for security
    const roleValue = camelUser.role || "student";
    const signedRole = await signCookieValue(roleValue);

    // Set cookies and return user + sessionToken
    const response = NextResponse.json({
      success: true,
      user: camelUser,
      sessionToken,
    });

    response.cookies.set("fahem_role", signedRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    response.cookies.set("fahem_session", sessionToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { success: false, message: "خطأ في الخادم، يرجى المحاولة لاحقاً" },
      { status: 500 }
    );
  }
}
