"use client";
import React, { useState, useRef } from "react";
import { UploadCloud, X, RefreshCw } from "lucide-react";

export default function ImageUpload({
  value,
  onChange,
  objectFit = "cover",
  maxWidth = 1200,
  maxHeight = 1200,
  label = "اسحب وأفلت الصورة هنا",
  subLabel = "أو اضغط لاختيار ملف (سيتم ضغطه تلقائياً)",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / maxWidth > height / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          onChange(compressedBase64);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    }
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 group flex items-center justify-center min-h-[160px]">
          <img
            src={value}
            alt="Preview"
            className={`w-full ${
              objectFit === "contain"
                ? "max-h-64 object-contain p-2"
                : "h-48 object-cover"
            }`}
          />
          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-slate-800 px-3 py-2 rounded-xl shadow-md hover:bg-slate-100 transition-all font-bold text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-[#C4963A]" />
              تغيير الصورة
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-white text-rose-600 px-3 py-2 rounded-xl shadow-md hover:bg-rose-50 transition-all font-bold text-xs flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              إزالة الصورة
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full min-h-[150px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all outline-none focus:ring-2 focus:ring-[#C4963A]/40 ${
            isDragging
              ? "border-[#C4963A] bg-[#C4963A]/10 scale-[1.01]"
              : "border-slate-300 bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 transition-colors ${
              isDragging
                ? "bg-[#C4963A] text-white"
                : "bg-white text-slate-400 border border-slate-200"
            }`}
          >
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">{label}</p>
          <p className="text-xs text-slate-400 mt-1">{subLabel}</p>
          <span className="text-[10px] text-slate-400/80 mt-1 bg-slate-200/60 px-2 py-0.5 rounded-full">
            أو الصق صورة مباشرة (Ctrl + V)
          </span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
