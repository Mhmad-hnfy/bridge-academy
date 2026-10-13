"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  UploadCloud,
  Link2,
  ExternalLink,
  X,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Eye,
  RefreshCw
} from "lucide-react";

export default function PdfOrDriveUpload({
  value = "",
  onChange,
  onMetaChange,
  initialFileName = "",
  label = "المذكرة أو ملزمة الـ PDF",
  placeholder = "https://drive.google.com/file/d/..."
}) {
  // تحديد التبويب المبدئي بناءً على القيمة
  const isInitialUrl = typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"));
  const [activeTab, setActiveTab] = useState(isInitialUrl ? "drive" : "file");

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(initialFileName || "");
  const [fileSize, setFileSize] = useState("");
  const [driveUrl, setDriveUrl] = useState(isInitialUrl ? value : "");
  const [sizeWarning, setSizeWarning] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (typeof value === "string") {
      if (value.startsWith("http://") || value.startsWith("https://")) {
        setDriveUrl(value);
        setActiveTab("drive");
      } else if (value.startsWith("data:")) {
        setActiveTab("file");
      }
    }
  }, [value]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file) => {
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      alert("يرجى اختيار ملف بصيغة PDF فقط.");
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    const sizeStr = sizeInMB >= 1 
      ? `${sizeInMB.toFixed(2)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    setFileName(file.name);
    setFileSize(sizeStr);

    if (sizeInMB > 12) {
      setSizeWarning(true);
    } else {
      setSizeWarning(false);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      onChange(base64, { fileName: file.name, fileSize: sizeStr, isDrive: false });
      if (onMetaChange) onMetaChange({ fileName: file.name, fileSize: sizeStr, isDrive: false });
    };
    reader.readAsDataURL(file);
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

  const handleDriveUrlChange = (url) => {
    setDriveUrl(url);
    onChange(url, { fileName: "رابط Google Drive", fileSize: "", isDrive: true });
    if (onMetaChange) onMetaChange({ fileName: "رابط Google Drive", fileSize: "", isDrive: true });
  };

  const handleClear = () => {
    setFileName("");
    setFileSize("");
    setDriveUrl("");
    setSizeWarning(false);
    onChange("", { fileName: "", fileSize: "", isDrive: false });
    if (onMetaChange) onMetaChange({ fileName: "", fileSize: "", isDrive: false });
  };

  const isDriveLink = driveUrl.includes("drive.google.com");

  return (
    <div className="w-full space-y-3" dir="rtl">
      {/* Tabs Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#C4963A]" />
          <span>{label}</span>
        </label>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "file"
                ? "bg-white text-[#1B3668] shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>سحب وإفلات PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("drive")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "drive"
                ? "bg-white text-[#1B3668] shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>رابط Google Drive</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Drag & Drop PDF File */}
      {activeTab === "file" && (
        <div>
          {value && !isInitialUrl && fileName ? (
            <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-800 text-sm truncate" title={fileName}>
                    {fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      {fileSize || "ملف PDF جاهز"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">تم تحويل الملف بنجاح</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all"
                  title="استبدال الملف"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-700" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all"
                  title="إزالة الملف"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,.pdf"
                className="hidden"
              />
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full min-h-[140px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all outline-none ${
                isDragging
                  ? "border-[#C4963A] bg-[#C4963A]/10 scale-[1.01]"
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-400"
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
              <p className="text-sm font-bold text-slate-700">
                اسحب وأفلت ملف الـ PDF هنا
              </p>
              <p className="text-xs text-slate-400 mt-1">
                أو اضغط لاختيار ملف من جهازك بصيغة PDF
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,.pdf"
                className="hidden"
              />
            </div>
          )}

          {/* تحذير في حالة الملف الكبير */}
          {sizeWarning && (
            <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                حجم الملف ({fileSize}) كبير نسبياً. للملفات الكبيرة يُفضّل استخدام تبويب <strong>"رابط Google Drive"</strong> لضمان سرعة تحميل فائقة وتوفير استهلاك البيانات للطلاب.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Google Drive or External Link */}
      {activeTab === "drive" && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="url"
              value={driveUrl}
              onChange={(e) => handleDriveUrlChange(e.target.value)}
              placeholder={placeholder}
              dir="ltr"
              className="w-full border border-slate-200 rounded-xl p-3 pl-20 text-sm font-mono focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none"
            />
            {driveUrl && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                  title="فتح الرابط للمعاينة"
                >
                  <Eye className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg text-xs"
                  title="مسح الرابط"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Drive Badge & Guidance */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              {isDriveLink ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700">تم التعرف على رابط Google Drive بنجاح</span>
                </>
              ) : (
                <>
                  <FolderOpen className="w-3.5 h-3.5 text-[#C4963A]" />
                  <span>يدعم روابط Google Drive، OneDrive، Dropbox والروابط المباشرة</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              💡 <strong>نصيحة:</strong> تأكد من ضبط إذن مشاركة الملف في Google Drive على: <em>"أي شخص لديه الرابط يمكنه العرض" (Anyone with the link can view)</em> لفتحه للطلاب دون طلب إذن.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
