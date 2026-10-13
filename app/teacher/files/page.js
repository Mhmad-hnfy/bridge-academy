"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Download,
  CheckCircle2,
  File,
  FolderOpen,
  Video,
  Layers,
  Search
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import PdfOrDriveUpload from "@/Components/PdfOrDriveUpload";

export default function TeacherFilesPage() {
  const {
    currentTeacher,
    courses = [],
    chapters = [],
    lessons = [],
    teacherFiles = [],
    addTeacherFile,
    deleteTeacherFile,
    updateLesson,
  } = useGlobalStore();

  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [fileValue, setFileValue] = useState("");
  const [fileMeta, setFileMeta] = useState({ fileName: "", fileSize: "", isDrive: false });
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lessonFilter, setLessonFilter] = useState("all");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const teacher = currentTeacher;
  const linkedCourse = courses.find((c) => c.id === teacher?.courseId);

  // If permission is denied
  if (teacher && teacher.canAddFiles === false) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-lg mx-auto mt-12" dir="rtl">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">غير مصرح لك بإدارة الملفات</h2>
        <p className="text-slate-500 text-sm">
          لم يتم تفعيل صلاحية "رفع الملفات والمذكرات" لحسابك من قبل إدارة المنصة. تواصل مع الأدمن لتفعيلها.
        </p>
      </div>
    );
  }

  // Chapters available for teacher
  const availableChapters = useMemo(() => {
    if (!teacher) return [];
    if (linkedCourse) {
      return chapters.filter((ch) => ch.courseId === linkedCourse.id);
    }
    const matchingCourses = courses.filter(
      (c) => c.name.includes(teacher.subject) || c.teacherId === teacher.id
    );
    const cIds = matchingCourses.map((c) => c.id);
    return chapters.filter((ch) => cIds.includes(ch.courseId));
  }, [teacher, linkedCourse, courses, chapters]);

  // Lessons for teacher
  const teacherLessons = useMemo(() => {
    const chIds = availableChapters.map((ch) => ch.id);
    return lessons.filter((l) => chIds.includes(parseInt(l.chapterId, 10)));
  }, [availableChapters, lessons]);

  // Filter files belonging to this teacher
  const myFiles = useMemo(() => {
    if (!teacher) return [];
    return teacherFiles.filter(
      (f) =>
        f.teacherId === teacher.id ||
        (linkedCourse && f.courseId === linkedCourse.id)
    );
  }, [teacher, teacherFiles, linkedCourse]);

  // Filtered files by search & lesson
  const filteredFiles = useMemo(() => {
    return myFiles.filter((f) => {
      if (searchTerm && !f.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (lessonFilter !== "all") {
        if (lessonFilter === "general") {
          return !f.lessonId;
        }
        return f.lessonId?.toString() === lessonFilter;
      }
      return true;
    });
  }, [myFiles, searchTerm, lessonFilter]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");

    if (!fileValue) {
      alert("يرجى سحب وإفلات ملف PDF أو وضع رابط Google Drive.");
      return;
    }

    const lessonIdNum = selectedLessonId ? parseInt(selectedLessonId, 10) : null;

    const payload = {
      title,
      fileUrl: fileValue,
      fileType: fileMeta.isDrive ? "drive" : "pdf",
      fileSize: fileMeta.fileSize || null,
      lessonId: lessonIdNum,
      teacherId: teacher.id,
      courseId: teacher.courseId || null,
    };

    addTeacherFile(payload);

    // تحديث ملف الدرس مباشرة ليظهر تحت مشغل الفيديو فوراً للطلاب
    if (lessonIdNum) {
      updateLesson(lessonIdNum, {
        pdfFile: fileValue,
      });
    }

    showToast(
      lessonIdNum
        ? "تمت إضافة المذكرة وربطها بالفيديو لتظهر تحته مباشرة للطلاب!"
        : "تمت إضافة المذكرة العامة لمادتك بنجاح."
    );
    setShowModal(false);
    setFileValue("");
    setSelectedLessonId("");
    setFileMeta({ fileName: "", fileSize: "", isDrive: false });
  };

  const getLessonName = (lessonId) => {
    return lessons.find((l) => l.id === lessonId)?.name || null;
  };

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#C4963A]" />
            المذكرات وملفات PDF لمادتي
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            رفع الملازم وتحديد الفيديو / الدرس الذي تظهر تحته المذكرة للطلاب مباشرة.
          </p>
        </div>
        <button
          onClick={() => {
            setFileValue("");
            setSelectedLessonId("");
            setFileMeta({ fileName: "", fileSize: "", isDrive: false });
            setShowModal(true);
          }}
          className="px-6 py-2.5 bg-[#1B3668] hover:bg-[#24427D] text-white font-bold rounded-xl shadow-md shadow-[#1B3668]/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5 text-[#C4963A]" />
          إضافة مذكرة جديدة
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث عن مذكرة باسمها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:border-[#C4963A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-slate-400" />
          <select
            value={lessonFilter}
            onChange={(e) => setLessonFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#C4963A]"
          >
            <option value="all">كل المذكرات ({myFiles.length})</option>
            <option value="general">مذكرات عامة للمادة</option>
            {teacherLessons.map((l) => (
              <option key={l.id} value={l.id.toString()}>
                🎬 {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <File className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-700 mb-1">لا توجد مذكرات مطابقة</h3>
          <p className="text-slate-400 text-sm mb-6">
            يمكنك رفع مذكرات PDF بالسحب والإفلات أو بوضع رابط Google Drive واختيار الفيديو الذي تظهر تحته.
          </p>
          <button
            onClick={() => {
              setFileValue("");
              setSelectedLessonId("");
              setFileMeta({ fileName: "", fileSize: "", isDrive: false });
              setShowModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1B3668] text-white font-bold text-xs"
          >
            إضافة مذكرة الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => {
            const isBase64 = file.fileUrl?.startsWith("data:");
            const isDrive = file.fileUrl?.includes("drive.google.com");
            const linkedLessonName = file.lessonId ? getLessonName(file.lessonId) : null;

            return (
              <div
                key={file.id}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>

                    {isDrive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                        <FolderOpen className="w-3 h-3" />
                        Google Drive
                      </span>
                    ) : isBase64 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                        <FileText className="w-3 h-3" />
                        ملف PDF مرفوع
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                        رابط خارجي
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-slate-900 mb-2 line-clamp-2">
                    {file.title}
                  </h3>

                  {/* شارة الفيديو المرتبط */}
                  {linkedLessonName ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-xl mb-3">
                      <Video className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate" title={linkedLessonName}>
                        تظهر تحت فيديو: <strong>{linkedLessonName}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl mb-3">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>مذكرة عامة لمادة ({teacher?.subject})</span>
                    </div>
                  )}

                  {file.fileSize && (
                    <p className="text-xs text-slate-400 font-bold mb-3">
                      الحجم: {file.fileSize}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {isBase64 ? (
                    <a
                      href={file.fileUrl}
                      download={`${file.title || "مذكرة"}.pdf`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل المذكرة</span>
                    </a>
                  ) : (
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3668] hover:bg-[#24427D] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isDrive ? "فتح في Drive" : "فتح الرابط"}</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف المذكرة "${file.title}"؟`)) {
                        deleteTeacherFile(file.id);
                        showToast("تم حذف المذكرة بنجاح.");
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="حذف المذكرة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#C4963A]" />
              <span>إضافة مذكرة واختيار الفيديو التابع لها</span>
            </h2>
            <p className="text-xs text-slate-400 font-bold mb-6">
              اختر الفيديو الذي تظهر تحته المذكرة مباشرة للطلاب، أو اتركها عامة للمادة.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  عنوان المذكرة / الملزمة *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="مثال: مذكرة شرح ومسائل المحاضرة الأولى"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#C4963A] outline-none font-bold"
                />
              </div>

              {/* اختيار الفيديو / الدرس التابع له المذكرة */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                <label className="block text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-amber-600" />
                  <span>تظهر تحت أي فيديو / درس؟</span>
                </label>

                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold bg-white focus:border-[#C4963A] outline-none"
                >
                  <option value="">-- مذكرة عامة للمادة (لا تتبع فيديو محدد) --</option>
                  {availableChapters.map((chapter) => {
                    const chLessons = teacherLessons.filter(
                      (l) => parseInt(l.chapterId, 10) === chapter.id
                    );
                    if (chLessons.length === 0) return null;
                    return (
                      <optgroup key={chapter.id} label={`📁 فصل: ${chapter.name}`}>
                        {chLessons.map((l) => (
                          <option key={l.id} value={l.id}>
                            🎬 {l.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>

                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedLessonId ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ستظهر المذكرة فوراً تحت مشغل الفيديو للدرس المحدد لجميع الطلاب!
                    </span>
                  ) : (
                    "إذا تركتها عامة، ستظهر في قائمة المذكرات العامة للمادة."
                  )}
                </p>
              </div>

              {/* مكون رفع المذكرة (سحب وإفلات أو Google Drive) */}
              <PdfOrDriveUpload
                value={fileValue}
                onChange={(val, meta) => {
                  setFileValue(val);
                  if (meta) setFileMeta(meta);
                }}
                label="ملف المذكرة (سحب وإفلات أو رابط Drive)"
              />

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1B3668] text-white font-bold text-xs hover:bg-[#24427D] shadow-md transition-all"
                >
                  حفظ المذكرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
