"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Home, ArrowRight, BookOpen, Calculator } from "lucide-react";

const mathSymbols = [
  "∑", "π", "√", "∞", "∫", "÷", "×", "α", "β", "θ",
  "Δ", "Ω", "∂", "∇", "≈", "≠", "±", "∈", "∀", "∃",
  "x²", "sin", "cos", "tan", "log", "lim", "dx", "dy",
];

function FloatingSymbol({ symbol, style }) {
  return (
    <span
      className="floating-symbol"
      style={style}
      aria-hidden="true"
    >
      {symbol}
    </span>
  );
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [symbols, setSymbols] = useState([]);

  useEffect(() => {
    setMounted(true);
    const generated = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      symbol: mathSymbols[i % mathSymbols.length],
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 22 + 12}px`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 8 + 6}s`,
        opacity: Math.random() * 0.25 + 0.08,
      },
    }));
    setSymbols(generated);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        .nf-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #0d1f3c 0%, #1B3668 45%, #0f2550 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          position: relative;
          overflow: hidden;
          padding: 24px;
        }

        /* Radial glow */
        .nf-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 30% 50%, rgba(196,150,58,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 75% 30%, rgba(27,54,104,0.4) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Grid pattern */
        .nf-root::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(196,150,58,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(196,150,58,0.04) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
        }

        /* Floating math symbols */
        .floating-symbol {
          position: absolute;
          color: #C4963A;
          font-weight: 700;
          pointer-events: none;
          user-select: none;
          animation: floatUp var(--dur, 8s) var(--delay, 0s) ease-in-out infinite alternate;
        }

        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50%  { transform: translateY(-30px) rotate(10deg); opacity: 0.3; }
          100% { transform: translateY(10px) rotate(-8deg); opacity: 0.12; }
        }

        /* Glass card */
        .nf-card {
          position: relative;
          z-index: 10;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(196,150,58,0.2);
          border-radius: 32px;
          padding: 56px 48px;
          max-width: 620px;
          width: 100%;
          text-align: center;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 32px 80px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.08);
          animation: cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* 404 number */
        .nf-404 {
          font-size: clamp(100px, 22vw, 160px);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -4px;
          background: linear-gradient(135deg, #C4963A 0%, #f0c060 40%, #C4963A 70%, #a07830 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          display: inline-block;
          text-shadow: none;
          filter: drop-shadow(0 4px 24px rgba(196,150,58,0.35));
          animation: pulse404 3s ease-in-out infinite;
        }

        @keyframes pulse404 {
          0%, 100% { filter: drop-shadow(0 4px 24px rgba(196,150,58,0.35)); }
          50%       { filter: drop-shadow(0 8px 40px rgba(196,150,58,0.6)); }
        }

        /* Middle zero decoration */
        .nf-404-zero {
          position: relative;
          display: inline-block;
        }
        .nf-404-zero::after {
          content: 'π';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.32em;
          background: linear-gradient(135deg, #C4963A, #f0c060);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0.8;
          animation: spinSlow 8s linear infinite;
        }

        @keyframes spinSlow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .nf-divider {
          width: 64px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #C4963A, transparent);
          margin: 20px auto;
          border-radius: 2px;
        }

        .nf-title {
          color: #ffffff;
          font-size: clamp(22px, 5vw, 30px);
          font-weight: 900;
          margin-bottom: 12px;
          text-shadow: 0 2px 16px rgba(0,0,0,0.3);
        }

        .nf-desc {
          color: rgba(255,255,255,0.55);
          font-size: 15px;
          font-weight: 400;
          line-height: 1.7;
          margin-bottom: 36px;
        }

        .nf-equation {
          display: inline-block;
          background: rgba(196,150,58,0.08);
          border: 1px solid rgba(196,150,58,0.2);
          border-radius: 12px;
          padding: 8px 20px;
          color: #C4963A;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 36px;
          letter-spacing: 1px;
        }

        /* Buttons */
        .nf-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #C4963A, #d4a84a);
          color: #0d1f3c;
          font-family: 'Cairo', sans-serif;
          font-size: 15px;
          font-weight: 800;
          border-radius: 14px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(196,150,58,0.4);
        }
        .nf-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(196,150,58,0.55);
          background: linear-gradient(135deg, #d4a84a, #e8c060);
        }
        .nf-btn-primary:active {
          transform: translateY(0);
        }

        .nf-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 24px;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.8);
          font-family: 'Cairo', sans-serif;
          font-size: 14px;
          font-weight: 700;
          border-radius: 14px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .nf-btn-secondary:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-2px);
          color: #fff;
        }

        .nf-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Quick links */
        .nf-links {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 36px;
          padding-top: 28px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .nf-link-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: rgba(27,54,104,0.5);
          border: 1px solid rgba(196,150,58,0.15);
          border-radius: 50px;
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          font-family: 'Cairo', sans-serif;
          transition: all 0.2s ease;
        }
        .nf-link-pill:hover {
          background: rgba(196,150,58,0.12);
          border-color: rgba(196,150,58,0.35);
          color: #C4963A;
          transform: translateY(-1px);
        }

        .nf-badge {
          position: absolute;
          top: 24px;
          right: 28px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(196,150,58,0.1);
          border: 1px solid rgba(196,150,58,0.25);
          border-radius: 50px;
          padding: 6px 14px;
          color: #C4963A;
          font-size: 13px;
          font-weight: 800;
        }
      `}</style>

      <div className="nf-root">
        {/* Floating Math Symbols */}
        {mounted && symbols.map((s) => (
          <FloatingSymbol
            key={s.id}
            symbol={s.symbol}
            style={{
              ...s.style,
              "--dur": s.style.animationDuration,
              "--delay": s.style.animationDelay,
            }}
          />
        ))}

        <div className="nf-card">
          {/* Brand badge */}
          <div className="nf-badge">
            <Calculator size={14} />
            <span>معادلة</span>
          </div>

          {/* 404 */}
          <div className="nf-404">
            4<span className="nf-404-zero">0</span>4
          </div>

          <div className="nf-divider" />

          <h1 className="nf-title">عذراً! الصفحة غير موجودة</h1>

          <p className="nf-desc">
            يبدو أن الصفحة التي تبحث عنها لم تعد موجودة أو تم نقلها.<br />
            لكن لا تقلق — يمكنك العودة إلى الصفحة الرئيسية أو استكشاف محتوانا التعليمي.
          </p>

          <div className="nf-equation" dir="ltr">
            error = page_not_found × 404
          </div>

          {/* Action Buttons */}
          <div className="nf-actions">
            <Link href="/" className="nf-btn-primary">
              <Home size={17} />
              <span>الصفحة الرئيسية</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="nf-btn-secondary"
            >
              <ArrowRight size={16} />
              <span>الصفحة السابقة</span>
            </button>
          </div>

          {/* Quick Links */}
          <div className="nf-links">
            <Link href="/courses" className="nf-link-pill">
              <BookOpen size={12} />
              المواد الدراسية
            </Link>
            <Link href="/login" className="nf-link-pill">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="nf-link-pill">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
