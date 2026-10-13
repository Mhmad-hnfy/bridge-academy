"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Trash2,
  Edit2,
  GraduationCap,
  Layers,
  Copy,
  CheckSquare,
  Square,
  Check,
  Sparkles,
  Video,
  FileText
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import ImageUpload from "@/Components/ImageUpload";

export default function CoursesManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  // مودال استدعاء / نسخ مادة
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState("");
  const [cloneTargetCategoryId, setCloneTargetCategoryId] = useState("");
  const [cloneNewName, setCloneNewName] = useState("");
  const [isCloning, setIsCloning] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const {
    courses,
    categories,
    classes,
    teachers,
    chapters = [],
    lessons = [],
    addCourse,
    updateCourse,
    deleteCourse,
    cloneCourse,
  } = useGlobalStore();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setUploadedImage("");
    setSelectedCategoryIds(categories.length > 0 ? [categories[0].id] : []);
    setShowAddModal(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setUploadedImage(course.image || "");
    const initialCats = Array.isArray(course.categoryIds) && course.categoryIds.length > 0
      ? course.categoryIds
      : (course.categoryId ? [course.categoryId] : []);
    setSelectedCategoryIds(initialCats);
    setShowAddModal(true);
  };

  const toggleCategorySelection = (catId) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // يجب إبقاء كورس واحد على الأقل
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const selectAllCategories = () => {
    setSelectedCategoryIds(categories.map((c) => c.id));
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const teacherId = parseInt(formData.get("teacherId"), 10);
    const active = formData.get("isActive") === "on";

    if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
      alert("يرجى اختيار كورس / مرحلة واحدة على الأقل للمادة");
      return;
    }

    const payload = {
      name,
      teacherId,
      image: uploadedImage || "",
      active,
      categoryId: selectedCategoryIds[0],
      categoryIds: selectedCategoryIds,
    };

    if (editingCourse) {
      await updateCourse(editingCourse.id, payload);
      showToast("تم تحديث المادة الدراسية بنجاح.");
    } else {
      await addCourse(payload);
      showToast("تمت إضافة المادة وتوزيعها على الكورسات المحددة بنجاح.");
    }

    setShowAddModal(false);
    setEditingCourse(null);
    setUploadedImage("");
    setSelectedCategoryIds([]);
  };

  // معالجة استدعاء ونسخ مادة
  const handleStartClone = (course) => {
    setCloneSourceId(course.id.toString());
    setCloneNewName(`${course.name} (مستدعى)`);
    setCloneTargetCategoryId(categories.length > 0 ? categories[0].id.toString() : "");
    setShowCloneModal(true);
  };

  const handleExecuteClone = async (e) => {
    e.preventDefault();
    if (!cloneSourceId || !cloneTargetCategoryId) {
      alert("يرجى تحديد المادة والكورس المستهدف");
      return;
    }

    setIsCloning(true);
    try {
      const result = await cloneCourse(
        parseInt(cloneSourceId, 10),
        parseInt(cloneTargetCategoryId, 10),
        cloneNewName
      );
      if (result) {
        showToast(`تم استدعاء ونسخ المادة وفصولها ودروسها بنجاح إلى الكورس المحدد!`);
        setShowCloneModal(false);
        setCloneSourceId("");
        setCloneNewName("");
      } else {
        alert("حدث خطأ أثناء استدعاء المادة، يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ غير متوقع.");
    } finally {
      setIsCloning(false);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeacherName = (id) =>
    teachers.find((t) => t.id === id)?.name || "مدرس غير محدد";

  // الحصول على أسماء الكورسات المرتبطة بالمادة
  const getLinkedCategories = (course) => {
    const ids = Array.isArray(course.categoryIds) && course.categoryIds.length > 0
      ? course.categoryIds
      : (course.categoryId ? [course.categoryId] : []);
    
    // إذا لم يكن موجوداً نفحص من الكلاس
    if (ids.length === 0 && course.classId) {
      const cl = classes.find(c => c.id === course.classId);
      if (cl?.categoryId) ids.push(cl.categoryId);
    }

    return categories.filter((c) => ids.includes(c.id));
  };

  const getCourseStats = (courseId) => {
    const courseChapters = chapters.filter((ch) => ch.courseId === courseId);
    const chIds = courseChapters.map((ch) => ch.id);
    const courseLessons = lessons.filter((l) => chIds.includes(l.chapterId));
    return {
      chaptersCount: courseChapters.length,
      lessonsCount: courseLessons.length,
    };
  };

  const selectedSourceCourse = courses.find((c) => c.id.toString() === cloneSourceId);
  const selectedSourceStats = selectedSourceCourse ? getCourseStats(selectedSourceCourse.id) : null;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1B3668] text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-4 border border-[#C4963A]">
          <Check className="w-5 h-5 text-[#C4963A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            إدارة المواد الدراسية
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            التحكم في المواد، واستدعاؤها أو ربطها بأكثر من كورس ومرحلة دراسية.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* زر استدعاء ونسخ مادة */}
          <button
            onClick={() => {
              if (courses.length === 0) {
                alert("لا توجد مواد مسجلة حالياً لاستدعائها.");
                return;
              }
              const first = courses[0];
              setCloneSourceId(first.id.toString());
              setCloneNewName(`${first.name} (مستدعى)`);
              setCloneTargetCategoryId(categories.length > 0 ? categories[0].id.toString() : "");
              setShowCloneModal(true);
            }}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Copy className="w-4 h-4 text-amber-600" />
            <span>استدعاء / نسخ مادة</span>
          </button>

          {/* زر إضافة مادة جديدة */}
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#1B3668] hover:bg-[#24427D] text-white font-bold rounded-xl shadow-md shadow-[#1B3668]/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-5 h-5 text-[#C4963A]" />
            <span>إضافة مادة جديدة</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث عن مادة باسمها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:border-[#C4963A]"
          />
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredCourses.map((course) => {
          const linkedCats = getLinkedCategories(course);
          const stats = getCourseStats(course.id);

          return (
            <div
              key={course.id}
              className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Course Image */}
                <div
                  className={`w-20 h-20 rounded-[20px] flex items-center justify-center shrink-0 overflow-hidden relative ${
                    course.active
                      ? "bg-[#FDF8F0] text-[#C4963A] border border-[#F0DDB8]"
                      : "bg-slate-50 text-slate-400 border border-slate-200"
                  }`}
                >
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-9 h-9" />
                  )}
                </div>

                {/* Course Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xl font-black text-slate-800">
                      {course.name}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full shrink-0 ${
                        course.active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {course.active ? "مفعل" : "مغلق"}
                    </span>
                  </div>

                  {/* Teacher & Stats */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                      <GraduationCap className="w-3.5 h-3.5 text-[#C4963A]" />
                      {getTeacherName(course.teacherId)}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      {stats.chaptersCount} فصول
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                      <Video className="w-3.5 h-3.5 text-indigo-500" />
                      {stats.lessonsCount} درساً
                    </span>
                  </div>

                  {/* Linked Categories Badges */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#C4963A]" />
                      الكورسات والمراحل المربوطة بها ({linkedCats.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {linkedCats.length > 0 ? (
                        linkedCats.map((cat) => (
                          <span
                            key={cat.id}
                            className="bg-[#1B3668]/5 text-[#1B3668] border border-[#1B3668]/15 text-xs font-bold px-2.5 py-1 rounded-lg"
                          >
                            {cat.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">
                          غير محدد
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                {/* استدعاء / نسخ سريع */}
                <button
                  onClick={() => handleStartClone(course)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                  title="نسخ واستدعاء هذه المادة وفصولها إلى كورس آخر"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-600" />
                  <span>استدعاء لكورس آخر</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="p-2 text-slate-500 hover:text-[#1B3668] hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                    title="تعديل المادة والكورسات المرتبطة"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `هل أنت متأكد من حذف مادة "${course.name}"؟ سيتم حذف جميع فصولها ودروسها التابعة.`
                        )
                      ) {
                        deleteCourse(course.id);
                        showToast("تم حذف المادة بنجاح.");
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                    title="حذف المادة"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-100">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">
              لا توجد مواد مسجلة مطابقة للبحث.
            </p>
          </div>
        )}
      </div>

      {/* ── مودال إضافة / تعديل مادة (مع ربط متعدد) ───────────────────── */}
      {(showAddModal || editingCourse) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800">
                  {editingCourse ? "تعديل المادة الدراسية" : "إضافة مادة دراسية جديدة"}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-bold">
                  يمكنك استدعاء وربط المادة في كورس واحد أو عدة كورسات في نفس الوقت.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم المادة / الكورس
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingCourse ? editingCourse.name : ""}
                  placeholder="مثال: فيزياء المراجعة النهائية"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold"
                />
              </div>

              {/* اختيار الكورسات / المراحل (Multi-Select Checkboxes) */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#C4963A]" />
                    <span>الكورسات / المراحل التي تظهر فيها المادة</span>
                    <span className="bg-[#1B3668] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {selectedCategoryIds.length} محددة
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={selectAllCategories}
                    className="text-[11px] font-bold text-[#C4963A] hover:underline"
                  >
                    تحديد الكل
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 font-medium">
                  اختر كورس أو أكثر. ستظهر المادة وفصولها ودروسها تلقائياً لجميع طلاب الكورسات المحددة.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategorySelection(cat.id)}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between text-xs font-bold ${
                          isSelected
                            ? "bg-white border-[#1B3668] text-[#1B3668] shadow-xs"
                            : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#C4963A] shrink-0 mr-2" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 shrink-0 mr-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  مدرس المادة
                </label>
                <select
                  name="teacherId"
                  required
                  defaultValue={editingCourse ? editingCourse.teacherId : ""}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#C4963A] focus:ring-1 outline-none bg-white font-bold"
                >
                  <option value="">اختر المدرس...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject || "مادة غير محددة"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  صورة المادة (اختياري - اسحب وأفلت الصورة)
                </label>
                <ImageUpload
                  value={uploadedImage}
                  onChange={setUploadedImage}
                  label="اسحب وأفلت صورة المادة هنا"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  defaultChecked={editingCourse ? editingCourse.active : true}
                  className="w-5 h-5 accent-[#C4963A] rounded cursor-pointer"
                />
                <label
                  htmlFor="isActive"
                  className="text-xs font-bold text-slate-700 cursor-pointer"
                >
                  تفعيل المادة مباشرة وظهورها للطلاب
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCourse(null);
                    setUploadedImage("");
                    setSelectedCategoryIds([]);
                  }}
                  className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 font-bold text-white bg-[#1B3668] hover:bg-[#24427D] rounded-xl shadow-md text-xs transition-all"
                >
                  {editingCourse ? "حفظ التعديلات" : "إضافة المادة وحفظها"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── مودال استدعاء ونسخ مادة بالكامل ─────────────────────────── */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Copy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  استدعاء ونسخ مادة بالكامل
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  نسخ المادة بجميع فصولها ودروسها وفيديوهاتها إلى كورس آخر
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteClone} className="space-y-4">
              {/* اختيار المادة المصدر */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختر المادة المراد استدعاؤها / نسخها
                </label>
                <select
                  value={cloneSourceId}
                  onChange={(e) => {
                    setCloneSourceId(e.target.value);
                    const sel = courses.find((c) => c.id.toString() === e.target.value);
                    if (sel) setCloneNewName(`${sel.name} (مستدعى)`);
                  }}
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold bg-white focus:border-[#C4963A] outline-none"
                >
                  <option value="">اختر مادة...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({getTeacherName(c.teacherId)})
                    </option>
                  ))}
                </select>
              </div>

              {/* بطاقة معلومات المادة المختارة */}
              {selectedSourceCourse && selectedSourceStats && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>محتوى المادة التي سيتم نسخها:</span>
                    <span className="bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">
                      نسخة متطابقة
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 font-bold pt-1">
                    <div className="bg-white p-2 rounded-lg border border-amber-100">
                      📁 {selectedSourceStats.chaptersCount} فصول دراسية
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-amber-100">
                      🎬 {selectedSourceStats.lessonsCount} درساً وفيديو
                    </div>
                  </div>
                </div>
              )}

              {/* اختيار الكورس المستهدف */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الكورس / المرحلة المستهدفة (التي ستُضاف إليها المادة)
                </label>
                <select
                  value={cloneTargetCategoryId}
                  onChange={(e) => setCloneTargetCategoryId(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold bg-white focus:border-[#C4963A] outline-none"
                >
                  <option value="">اختر الكورس المستهدف...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* اسم المادة في الكورس الجديد */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم المادة في الكورس الجديد
                </label>
                <input
                  type="text"
                  required
                  value={cloneNewName}
                  onChange={(e) => setCloneNewName(e.target.value)}
                  placeholder="مثال: فيزياء - معادلة حاسبات"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:border-[#C4963A] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCloneModal(false)}
                  disabled={isCloning}
                  className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCloning}
                  className="flex-1 py-3 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-2"
                >
                  {isCloning ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري نسخ الفصول والدروس...</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>بدء استدعاء ونسخ المادة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
