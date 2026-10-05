"use client";
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const WHATSAPP_NUMBER = "201022714993"; // رقم الدعم الفني بدون + 
const WHATSAPP_MESSAGE = "مرحباً، أحتاج مساعدة في Bridge Academy 🎓";

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا على واتساب"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-6 left-6 z-[9999] flex items-center gap-3 group"
      style={{ direction: "rtl" }}
    >
      {/* Tooltip */}
      <span
        className={`
          hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white
          bg-[#25D366] shadow-lg shadow-[#25D366]/30
          transition-all duration-300 whitespace-nowrap
          ${hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}
        `}
      >
        تواصل معنا الآن
      </span>

      {/* Main button */}
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-[#25D366]/40 transition-transform duration-300 group-hover:scale-110"
        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />

        {/* WhatsApp SVG icon */}
        <svg
          viewBox="0 0 32 32"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
        >
          <path d="M16 2C8.27 2 2 8.27 2 16c0 2.49.68 4.82 1.85 6.83L2 30l7.37-1.82A13.93 13.93 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.5a11.43 11.43 0 01-5.85-1.6l-.42-.25-4.37 1.08 1.1-4.25-.28-.44A11.47 11.47 0 014.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.28-8.58c-.34-.17-2.02-1-2.34-1.11-.31-.11-.54-.17-.77.17-.23.34-.88 1.11-1.08 1.34-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.86-1.06-2.55-.28-.67-.56-.58-.77-.59h-.65c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.86 0 1.69 1.22 3.32 1.4 3.55.17.23 2.42 3.69 5.86 5.17.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.02-.82 2.31-1.62.28-.8.28-1.48.2-1.62-.09-.14-.31-.23-.65-.4z" />
        </svg>
      </div>
    </a>
  );
}
