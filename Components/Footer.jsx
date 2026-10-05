"use client";
import React from "react";
import Image from "next/image";
import {
  Facebook,
  Youtube,
  Phone,
  Send,
} from "lucide-react";

// Bridge Academy brand colors
const C = {
  navy: "#1B3668",
  navyDark: "#122040",
  navyMid: "#2D559E",
  gold: "#C4963A",
  goldLight: "#D4A84A",
  offWhite: "#F8F5F0",
  offWhite2: "#F0EBE3",
  border: "#E5DDD2",
  muted: "rgba(240,235,227,0.70)",
  mutedText: "rgba(240,235,227,0.55)",
};

const Footer = () => {
  const linkSections = [
    {
      title: "روابط سريعة",
      links: [
        { name: "الرئيسية", href: "/" },
        { name: "المسارات التعليمية", href: "/courses" },
        { name: "المدرسون", href: "/Team" },
        { name: "تواصل معنا", href: "#contact" },
        
      ],
    },
    
  ];

  const socialLinks = [
    { icon: <Facebook size={17} />, href: "https://www.facebook.com/share/19WoCKnLA4/" },
    { icon: <Send size={17} />, href: "https://t.me/Bridge_Academy_moadla" },
    { icon: <Youtube size={17} />, href: "https://youtube.com/@bridgeacademymoadla" },
  ];

  return (
    <footer
      className="relative pt-16 pb-8 overflow-hidden"
      id="contact"
      style={{
        background: `linear-gradient(160deg, ${C.navyDark} 0%, ${C.navy} 55%, ${C.navyMid} 100%)`,
      }}
    >
      {/* Top gold line */}
      <div
        className="absolute top-0 left-0 w-full h-[20px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
        }}
      />

      {/* Background glow accents */}
      <div
        className="absolute -top-28 -right-28 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: `rgba(196,150,58,0.07)`, filter: "blur(80px)" }}
      />
      <div
        className="absolute -bottom-28 -left-28 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: `rgba(27,54,104,0.4)`, filter: "blur(80px)" }}
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-14">
          {/* ── Brand ── */}
          <div className="col-span-1">
            {/* Logo + Name */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                style={{
                  border: `2px solid rgba(196,150,58,0.35)`,
                  background: C.offWhite2,
                }}
              >
                <Image
                  src="/logo2.jpeg"
                  alt="Bridge Academy"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-black text-white tracking-tight">
                  Bridge Academy
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: C.gold }}
                >
                  مواد معادلة كلية الهندسة
                </span>
              </div>
            </div>

            <p
              className="leading-relaxed mb-7 text-sm font-medium"
              style={{ color: C.muted }}
            >
              Bridge Academy — وجهتك الأولى لمحتوى مواد معادلة كلية الهندسة .
              نقدم أفضل الشروحات والمسارات التعليمية لطلاب معادلة كلية الهندسة
              بأعلى مستوى.
            </p>

            {/* Socials */}
            <div className="flex gap-3">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{
                    background: "rgba(196,150,58,0.10)",
                    border: "1px solid rgba(196,150,58,0.22)",
                    color: "rgba(240,235,227,0.75)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`;
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(196,150,58,0.10)";
                    e.currentTarget.style.color = "rgba(240,235,227,0.75)";
                    e.currentTarget.style.borderColor = "rgba(196,150,58,0.22)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Links ── */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
            {linkSections.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-white font-bold text-sm mb-5 relative inline-block uppercase tracking-wide">
                  {section.title}
                  <span
                    className="absolute -bottom-1 right-0 h-0.5 rounded-full"
                    style={{
                      width: "1.8rem",
                      background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
                    }}
                  />
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href}
                        className="group flex items-center gap-2 text-sm font-medium transition-all duration-300"
                        style={{ color: C.mutedText }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = C.goldLight)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = C.mutedText)
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          style={{ background: C.gold }}
                        />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Newsletter + Contact ── */}
          <div className="col-span-1">
            {/*  */}

            <div
              className="mt-7 pt-6 border-t space-y-3"
              style={{ borderColor: "rgba(196,150,58,0.18)" }}
            >
              {[
                { icon: <Phone size={13} />, text: "الحجز والكاش: 01509975077" },
                { icon: <Send size={13} />, text: "الدعم الفني (واتس/تليجرام): 01022714993" },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0"
                    style={{
                      background: "rgba(196,150,58,0.10)",
                      borderColor: "rgba(196,150,58,0.22)",
                      color: C.goldLight,
                    }}
                  >
                    {icon}
                  </div>
                  <span
                    className="font-medium"
                    style={{ color: "rgba(240,235,227,0.82)" }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="pt-1 border-t flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: "rgba(196,150,58,0.18)" }}
        >
          <p
            className="text-xs md:text-sm text-center md:text-right font-medium"
            style={{ color: "rgba(240,235,227,0.45)" }}
          >
            جميع الحقوق محفوظة © {new Date().getFullYear()}{" "}
            <span className="font-bold" style={{ color: C.goldLight }}>
              Bridge Academy
            </span>
          </p>
          <a
            href="https://www.facebook.com/mohamed.hanafy.446285?locale=ar_AR"
            className="text-sm font-medium transition-colors"
            style={{ color: "rgba(240,235,227,0.45)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.goldLight)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(240,235,227,0.45)")
            }
          >
            Code By Mohamed Hanafy
          </a>
          <div className="flex items-center gap-5"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
