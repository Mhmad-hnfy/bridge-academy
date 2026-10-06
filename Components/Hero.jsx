"use client";
import React, { useState, useEffect, useRef } from "react";
import { useGlobalStore } from "@/lib/store";
import Image from "next/image";

// Brand colors — exact match to Bridge Academy logo
const C = {
  navy: "#1B3668",
  navyDark: "#122040",
  navyMid: "#2D559E",
  navyLight: "#5A88D0",
  gold: "#C4963A",
  goldLight: "#D4A84A",
  goldPale: "#F2DFB0",
  offWhite: "#F8F5F0",
  offWhite2: "#F0EBE3",
  offWhite3: "#E5DDD2",
  muted: "#6B7A95",
};

function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return [count, ref];
}

export default function Hero() {
  const { currentUser, users } = useGlobalStore();
  const studentCount = (users || []).filter((u) => u.role !== "admin").length;
  const targetStudents = 50 + studentCount;
  const [students, studentsRef] = useCounter(targetStudents, 1500);
  const [courses, coursesRef] = useCounter(120);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const transition = (delay = 0) => ({
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
  });

  return (
    <div
      className="relative isolate min-h-screen overflow-x-hidden"
      style={{
        background: `linear-gradient(155deg, ${C.offWhite} 0%, ${C.offWhite2} 45%, ${C.offWhite3} 100%)`,
      }}
    >
      {/* Background glow blobs */}
      <div
        className="absolute top-[-100px] right-[-80px] w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(27,54,104,0.09), transparent 70%)`,
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute bottom-[-60px] left-[-60px] w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(196,150,58,0.13), transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${8 + i * 4}px`,
            height: `${8 + i * 4}px`,
            top: `${10 + i * 13}%`,
            ...(i % 2 === 0
              ? { left: `${4 + i * 7}%` }
              : { right: `${5 + i * 6}%` }),
            background:
              i % 2 === 0
                ? `rgba(196,150,58,${0.22 + i * 0.04})`
                : `rgba(27,54,104,${0.1 + i * 0.03})`,
            animation: `particle-drift ${5 + i * 1.1}s ease-in-out infinite`,
            animationDelay: `${i * 0.9}s`,
          }}
        />
      ))}

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* ── Text Content ── */}
          <div className="space-y-8 text-center lg:text-right relative z-10">
            {/* Badge */}
            <div
              style={transition(0)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm"
              style={{
                ...transition(0),
                background: `rgba(196,150,58,0.09)`,
                border: `1px solid rgba(196,150,58,0.28)`,
                color: C.gold,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "9999px",
                fontSize: "0.875rem",
                fontWeight: 700,
                boxShadow: "0 1px 6px rgba(196,150,58,0.12)",
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: C.gold }}
                />
                <span
                  className="relative inline-flex rounded-full h-2.5 w-2.5"
                  style={{ background: C.gold }}
                />
              </span>
              Bridge Academy — معادلة كلية الهندسة
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight"
              style={{ color: C.navy, ...transition(100) }}
            >
              طريقك للتفوق <br />
              <span
                style={{
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight}, ${C.gold})`,
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 3s linear infinite",
                  display: "inline-block",
                }}
              >
                فى مواد معادلة كلية الهندسة
              </span>
            </h1>

            {/* Description */}
            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold"
              style={{ color: C.navyMid, ...transition(200) }}
            >
              أقوى المسارات التعليمية فى مواد معادلة كلية الهندسة ، مصممة خصيصاً
              للطلاب معادلة كلية الهندسة . تعلّم مع أفضل الأساتذة في أي
              وقت ومن أي مكان. 🎓
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              style={transition(300)}
            >
              {currentUser ? (
                <>
                  <a
                    href={currentUser.role === "admin" ? "/admin" : "/courses"}
                  >
                    <button
                      className="w-full sm:w-auto px-8 py-4 text-white font-bold rounded-2xl text-lg hover:-translate-y-1 transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${C.navyDark}, ${C.navy})`,
                        boxShadow: `0 10px 30px rgba(27,54,104,0.32)`,
                      }}
                    >
                      {currentUser.role === "admin"
                        ? "لوحة التحكم"
                        : "تصفح المسارات"}
                    </button>
                  </a>
                  <a href="/profile">
                    <button
                      className="w-full sm:w-auto px-8 py-4 font-bold rounded-2xl border-2 text-lg hover:-translate-y-1 transition-all duration-300"
                      style={{
                        background: "#fff",
                        color: C.navy,
                        borderColor: C.offWhite3,
                      }}
                    >
                      حسابي الشخصي
                    </button>
                  </a>
                </>
              ) : (
                <>
                  <a href="/register">
                    <button
                      className="relative w-full sm:w-auto px-8 py-4 text-white font-bold rounded-2xl text-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                      style={{
                        background: `linear-gradient(135deg, ${C.navyDark}, ${C.navy})`,
                        boxShadow: `0 10px 30px rgba(27,54,104,0.32)`,
                      }}
                    >
                      ابدأ رحلتك الآن
                    </button>
                  </a>
                  <a href="/parent/login">
                    <button
                      className="w-full sm:w-auto px-8 py-4 font-bold rounded-2xl border-2 text-lg hover:-translate-y-1 transition-all duration-300"
                      style={{
                        background: "#fff",
                        color: C.navy,
                        borderColor: C.offWhite3,
                      }}
                    >
                      متابعة ولي الأمر
                    </button>
                  </a>
                </>
              )}
            </div>

            {/* Stats */}
            <div
              className="flex items-center justify-center lg:justify-start gap-8 pt-6"
              style={transition(400)}
            >
              {/* Students */}
              <div className="flex items-center gap-3" ref={studentsRef}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${C.navyDark}, ${C.navy})`,
                  }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-black" style={{ color: C.navy }}>
                    +{students.toLocaleString("ar-EG")}
                  </div>
                  <div
                    className="text-xs font-semibold"
                    style={{ color: C.muted }}
                  >
                    طالب مسجّل
                  </div>
                </div>
              </div>

              <div className="w-px h-10" style={{ background: C.offWhite3 }} />

              {/* Courses */}
              <div className="flex items-center gap-3" ref={coursesRef}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                  }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-black" style={{ color: C.navy }}>
                    +{courses}
                  </div>
                  <div
                    className="text-xs font-semibold"
                    style={{ color: C.muted }}
                  >
                    محتوى معتمد
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Visual / Logo showcase ── */}
          <div
            className="relative mt-12 lg:mt-0 flex justify-center z-10"
            style={transition(300)}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-full animate-pulse pointer-events-none"
              style={{
                filter: "blur(70px)",
                background: `radial-gradient(circle, rgba(196,150,58,0.28), rgba(27,54,104,0.15))`,
              }}
            />

            {/* Card */}
            <div className="relative animate-float">
              {/* Outer glow ring */}
              <div
                className="absolute -inset-5 rounded-[32px] opacity-40 animate-border-glow pointer-events-none"
                style={{ border: `2px solid ${C.gold}` }}
              />

              {/* Logo card */}
              <div
                className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-[28px] overflow-hidden shadow-2xl"
                style={{
                  background: C.offWhite2,
                  border: `3px solid rgba(196,150,58,0.25)`,
                  boxShadow: `0 30px 80px rgba(27,54,104,0.18), 0 0 0 1px rgba(196,150,58,0.12)`,
                }}
              >
                <Image
                  src="/logo2.jpeg"
                  alt="Bridge Academy Logo"
                  fill
                  className="object-contain p-8"
                  priority
                />
              </div>

              {/* Floating pill — top */}
              <div
                className="absolute -top-5 -right-5 px-4 py-2 rounded-2xl text-white text-sm font-bold shadow-xl animate-float-slow"
                style={{
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                  animationDelay: "1s",
                  boxShadow: `0 8px 24px rgba(196,150,58,0.4)`,
                }}
              >
                🎓 Engineering
              </div>

              {/* Floating pill — bottom */}
              <div
                className="absolute -bottom-5 -left-5 px-4 py-2 rounded-2xl text-white text-sm font-bold shadow-xl animate-float-slow"
                style={{
                  background: `linear-gradient(135deg, ${C.navyDark}, ${C.navy})`,
                  animationDelay: "2.2s",
                  boxShadow: `0 8px 24px rgba(27,54,104,0.35)`,
                }}
              >
                📐 Mathematics
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
