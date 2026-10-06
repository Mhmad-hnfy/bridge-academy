"use client";

import React, { useState, useMemo, useRef } from "react";
import { useGlobalStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Youtube, 
  FileText, 
  ExternalLink,
  Search,
  Image as LucideImage,
  FolderTree,
  Grid,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Layers,
  BookOpen,
  RotateCcw,
  HelpCircle,
  Eye,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeftRight,
  MessageCircle,
  Send,
  X,
  GripVertical,
} from "lucide-react";
import ImageUpload from "@/Components/ImageUpload";

export default function LessonsManagement() {
  const { 
    categories, 
    classes, 
    courses,
    chapters, 
    lessons, 
    addLesson, 
    updateLesson, 
    deleteLesson,
    reorderLessons,
  } = useGlobalStore();

  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [whatsappPrompt, setWhatsappPrompt] = useState(null); // { lessonName, classId }
  const [searchQuery, setSearchQuery] = useState("");

  // Drag-and-drop state for lesson reordering
  const dragLessonId = useRef(null);
  const dragOverLessonId = useRef(null);
  const [draggingChapterId, setDraggingChapterId] = useState(null);
  
  // Local lesson order state per chapter (for optimistic UI)
  const [chapterLessonOrder, setChapterLessonOrder] = useState({});
  
  // Page-level filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // View Mode: 'grouped' (organized tree collapsible) or 'grid' (flat cards)
  const [viewMode, setViewMode] = useState("grouped");
  
  // Accordion state for expanded chapters
  const [expandedChapters, setExpandedChapters] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    courseId: "",
    chapterId: "",
    youtubeLink: "",
    banner: "",
    pdfFile: "", // Base64 or URL
    attachmentLink: "", // External URL (e.g. Quiz, Homework, Google Drive)
    attachmentTitle: "", // Title/Label for the link
    status: "نشط",
    maxViews: 5
  });

  // Dynamic filter lists for top filter bar
  const filterCoursesList = useMemo(() => {
    return courses.filter(c => !filterCategory || c.categoryId === parseInt(filterCategory) || classes.find(cl => cl.id === c.classId)?.categoryId === parseInt(filterCategory));
  }, [courses, filterCategory, classes]);

  const filterChaptersList = useMemo(() => {
    return chapters.filter(ch => !filterCourse || ch.courseId === parseInt(filterCourse));
  }, [chapters, filterCourse]);

  // Modal Dynamic lists
  const modalCoursesList = useMemo(() => {
    return courses.filter(c => !formData.categoryId || c.categoryId === parseInt(formData.categoryId) || classes.find(cl => cl.id === c.classId)?.categoryId === parseInt(formData.categoryId));
  }, [courses, formData.categoryId, classes]);

  const modalChaptersList = useMemo(() => {
    return chapters.filter(ch => ch.courseId === parseInt(formData.courseId));
  }, [chapters, formData.courseId]);

  // Handlers for modal field changes to reset subordinate selections
  const handleModalCategoryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      categoryId: e.target.value,
      courseId: "",
      chapterId: ""
    }));
  };

  const handleModalCourseChange = (e) => {
    setFormData(prev => ({
      ...prev,
      courseId: e.target.value,
      chapterId: ""
    }));
  };

  // Master filter logic
  const displayedLessons = useMemo(() => {
    return lessons.filter((l) => {
      const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase());
      const chap = chapters.find(ch => ch.id === parseInt(l.chapterId));
      const course = courses.find(co => co.id === chap?.courseId);
      const catId = l.categoryId || course?.categoryId || classes.find(cl => cl.id === course?.classId)?.categoryId;
      const matchesCategory = !filterCategory || catId === parseInt(filterCategory);
      const matchesStatus = !filterStatus || l.status === filterStatus;
      
      let matchesChapter = !filterChapter || l.chapterId === parseInt(filterChapter);
      
      if (filterCourse && !filterChapter) {
        matchesChapter = chap?.courseId === parseInt(filterCourse);
      }
      
      return matchesSearch && matchesCategory && matchesChapter && matchesStatus;
    });
  }, [lessons, searchQuery, filterCategory, filterCourse, filterChapter, filterStatus, chapters, courses, classes]);

  // Hierarchical grouped data directly: Category -> Courses -> Chapters -> Lessons
  const groupedData = useMemo(() => {
    const result = [];
    
    categories.forEach(cat => {
      const catCourses = [];
      
      courses.filter(course => (course.categoryId === cat.id || classes.find(cl => cl.id === course.classId)?.categoryId === cat.id)).forEach(course => {
        const courseChapters = [];
        
        chapters.filter(ch => ch.courseId === course.id).forEach(ch => {
          const chLessons = displayedLessons.filter(l => l.chapterId === ch.id);
          if (chLessons.length > 0) {
            courseChapters.push({
              ...ch,
              lessons: chLessons
            });
          }
        });
        
        if (courseChapters.length > 0) {
          catCourses.push({
            ...course,
            chapters: courseChapters
          });
        }
      });
      
      if (catCourses.length > 0) {
        result.push({
          ...cat,
          courses: catCourses
        });
      }
    });
    
    return result;
  }, [displayedLessons, categories, classes, courses, chapters]);

  // Lessons that don't belong to a valid Category/Course/Chapter
  const unassignedLessons = useMemo(() => {
    return displayedLessons.filter(l => {
      const chapter = chapters.find(ch => ch.id === parseInt(l.chapterId));
      const course = courses.find(co => co.id === chapter?.courseId);
      return !chapter || !course;
    });
  }, [displayedLessons, chapters, courses]);

  const toggleChapter = (id) => {
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const newExpanded = {};
    groupedData.forEach(cat => {
      cat.courses.forEach(course => {
        course.chapters.forEach(ch => {
          newExpanded[ch.id] = true;
        });
      });
    });
    setExpandedChapters(newExpanded);
  };

  const collapseAll = () => {
    setExpandedChapters({});
  };

  // Drag-and-drop reorder handler
  const handleDragEnd = (chapterId, chapterLessons) => {
    const fromId = dragLessonId.current;
    const toId = dragOverLessonId.current;
    if (!fromId || !toId || fromId === toId) {
      dragLessonId.current = null;
      dragOverLessonId.current = null;
      setDraggingChapterId(null);
      return;
    }

    // Get current order for this chapter
    const currentOrder = chapterLessonOrder[chapterId] || chapterLessons;
    const fromIdx = currentOrder.findIndex((l) => l.id === fromId);
    const toIdx = currentOrder.findIndex((l) => l.id === toId);

    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...currentOrder];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Assign new sortOrder values
    const withOrder = reordered.map((l, idx) => ({ ...l, sortOrder: idx + 1 }));

    // Update local UI state
    setChapterLessonOrder((prev) => ({ ...prev, [chapterId]: withOrder }));

    // Persist to DB
    reorderLessons(withOrder.map((l) => ({ id: l.id, sortOrder: l.sortOrder })));

    dragLessonId.current = null;
    dragOverLessonId.current = null;
    setDraggingChapterId(null);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterCategory("");
    setFilterCourse("");
    setFilterChapter("");
    setFilterStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submissionData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        chapterId: parseInt(formData.chapterId)
    };

    delete submissionData.courseId;

    if (editingLesson) {
      updateLesson(editingLesson.id, submissionData);
      setIsModalOpen(false);
      resetForm();
    } else {
      await addLesson(submissionData);
      setIsModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: "",
      courseId: "",
      chapterId: "",
      youtubeLink: "",
      banner: "",
      pdfFile: "",
      attachmentLink: "",
      attachmentTitle: "",
      status: "نشط",
      maxViews: 5
    });
    setEditingLesson(null);
  };

  const handleEdit = (lesson) => {
    const chapter = chapters.find(c => c.id === parseInt(lesson.chapterId));
    const course = courses.find(co => co.id === chapter?.courseId);
    const catId = lesson.categoryId || course?.categoryId || classes.find(cl => cl.id === course?.classId)?.categoryId;
    
    setEditingLesson(lesson);
    setFormData({
      name: lesson.name || "",
      categoryId: catId ? catId.toString() : "",
      courseId: course?.id?.toString() || "",
      chapterId: lesson.chapterId?.toString() || "",
      youtubeLink: lesson.youtubeLink || "",
      banner: lesson.banner || "",
      pdfFile: lesson.pdfFile || "",
      attachmentLink: lesson.attachmentLink || lesson.attachment_link || "",
      attachmentTitle: lesson.attachmentTitle || lesson.attachment_title || "",
      status: lesson.status || "نشط",
      maxViews: lesson.maxViews || 5
    });
    setIsModalOpen(true);
  };

  const handlePdfUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData({ ...formData, pdfFile: reader.result });
          };
          reader.readAsDataURL(file);
      }
  };

  // Helper selectors for names
  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || "بدون مرحلة";
  const getClassName = (id) => classes.find(c => c.id === id)?.name || "بدون صف";
  const getChapterName = (id) => chapters.find(c => c.id === id)?.name || "بدون باب";
  const getCourseNameByChapter = (chapterId) => {
    const ch = chapters.find(c => c.id === chapterId);
    const co = courses.find(c => c.id === ch?.courseId);
    return co?.name || "بدون مادة";
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-l from-slate-900 via-slate-850 to-slate-950 p-8 rounded-[36px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#C4963A]/10 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#C4963A]/5 rounded-full blur-[100px] -z-10"></div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-[#C4963A]/20 text-[#E8C87A] border border-[#C4963A]/30 text-xs font-black rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              منظم بالكامل
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight">إدارة وتنظيم الدروس</h1>
          <p className="text-slate-400 mt-2 font-medium">نظم دروسك، فيديوهاتك، وملفات الـ PDF داخل المراحل، الصفوف، المواد والأبواب الدراسية بسهولة تامة.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#C4963A] to-[#d4a84a] text-white rounded-2xl font-black hover:from-[#b8872e] hover:to-[#c4963a] transition-all shadow-lg shadow-[#C4963A]/20 border border-[#C4963A]/20 active:scale-95 shrink-0"
        >
          <Plus className="w-5.5 h-5.5 stroke-[3px]" />
          إضافة درس جديد
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-150 p-6 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
          {/* Main Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن درس بالاسم..."
              className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#C4963A] focus:bg-white focus:outline-none font-bold transition-all text-slate-700 placeholder-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Controls: View Mode & Collapsibles */}
          <div className="flex flex-wrap items-center gap-3">
            {viewMode === "grouped" && groupedData.length > 0 && (
              <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
                <button
                  onClick={expandAll}
                  className="px-3.5 py-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 font-black text-xs transition-colors"
                >
                  توسيع الكل
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3.5 py-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 font-black text-xs transition-colors"
                >
                  طي الكل
                </button>
              </div>
            )}

            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setViewMode("grouped")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all ${viewMode === "grouped" ? "bg-white text-[#C4963A] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <FolderTree className="w-4 h-4" />
                شجرة التصنيفات
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all ${viewMode === "grid" ? "bg-white text-[#C4963A] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <Grid className="w-4 h-4" />
                شبكة الدروس
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-700 font-black text-sm mb-4">
            <SlidersHorizontal className="w-4.5 h-4.5 text-[#C4963A]" />
            <span>فلاتر تصفية ذكية</span>
            {(filterCategory || filterCourse || filterChapter || filterStatus || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="mr-auto text-xs text-[#C4963A] hover:text-[#b8872e] font-black flex items-center gap-1 bg-[#FDF8F0] hover:bg-[#FBF0DC] px-3 py-1.5 rounded-lg transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                إعادة ضبط
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 pr-1">المرحلة الدراسية</label>
              <select
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:border-[#C4963A] focus:outline-none transition-all cursor-pointer text-slate-700"
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setFilterCourse("");
                  setFilterChapter("");
                }}
              >
                <option value="">كل المراحل</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Course Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 pr-1">المادة الدراسية</label>
              <select
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:border-[#C4963A] focus:outline-none transition-all cursor-pointer text-slate-700"
                value={filterCourse}
                onChange={(e) => {
                  setFilterCourse(e.target.value);
                  setFilterChapter("");
                }}
              >
                <option value="">كل المواد</option>
                {filterCoursesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Chapter Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 pr-1">الباب / الفصل</label>
              <select
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:border-[#C4963A] focus:outline-none transition-all cursor-pointer text-slate-700"
                value={filterChapter}
                onChange={(e) => setFilterChapter(e.target.value)}
              >
                <option value="">كل الأبواب</option>
                {filterChaptersList.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
              </select>
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 pr-1">حالة الدرس</label>
              <select
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:border-[#C4963A] focus:outline-none transition-all cursor-pointer text-slate-700"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">كل الحالات</option>
                <option value="نشط">نشط</option>
                <option value="غير نشط">غير نشط</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Results View */}
      {viewMode === "grouped" ? (
        // Hierarchical Collapsible View
        <div className="space-y-8">
          {groupedData.length === 0 && unassignedLessons.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center border border-slate-150 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد نتائج مطابقة للتصفية</h3>
              <p className="text-slate-400 font-bold max-w-md mx-auto mb-6 text-sm leading-relaxed">
                لم نجد أي دروس مطابقة لمعايير البحث الحالية. يرجى تعديل خيارات التصفية أو الضغط على زر إعادة الضبط.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-[#C4963A] text-white font-black rounded-xl hover:bg-[#b8872e] transition-all text-sm shadow-md"
              >
                إعادة ضبط كل فلاتر التصفية
              </button>
            </div>
          ) : (
            <>
              {groupedData.map((category) => (
                <div key={category.id} className="bg-white rounded-[32px] border border-slate-150 shadow-sm overflow-hidden p-6 lg:p-8 space-y-6">
                  {/* Category Level */}
                  <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FDF8F0] text-[#C4963A] rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-[#F0DDB8]">
                      {category.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">{category.name}</h2>
                      <p className="text-slate-400 text-xs font-bold mt-0.5">تحتوي هذه المرحلة على المواد والدروس المصنفة أدناه.</p>
                    </div>
                  </div>

                  {/* Courses Level */}
                  <div className="space-y-6 pr-0 lg:pr-4">
                    {category.courses.map((course) => (
                      <div key={course.id} className="bg-slate-50/40 rounded-3xl p-5 border border-slate-100 space-y-4 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                          <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-[#C4963A]" />
                            <span>{course.name}</span>
                          </h4>
                          <span className="text-[11px] font-black bg-[#FDF8F0] text-[#C4963A] px-3 py-1 rounded-full border border-[#F0DDB8]">
                            {category.name}
                          </span>
                        </div>

                              {/* Chapters Accordion Level */}
                              <div className="space-y-3">
                                {course.chapters.map((ch) => {
                                  const isExpanded = !!expandedChapters[ch.id];
                                  return (
                                    <div key={ch.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:border-slate-200 transition-colors">
                                      {/* Accordion Header */}
                                      <div
                                        onClick={() => toggleChapter(ch.id)}
                                        className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors ${isExpanded ? "bg-slate-50/80 border-b border-slate-100" : "bg-white hover:bg-slate-50/50"}`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-xl transition-colors ${isExpanded ? "bg-[#C4963A] text-white" : "bg-slate-100 text-slate-500"}`}>
                                            <Layers className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <span className="font-black text-sm text-slate-800 block">{ch.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{ch.lessons.length} دروس حالياً</span>
                                          </div>
                                        </div>
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                                      </div>

                                      {/* Accordion Content */}
                                      {isExpanded && (
                                        <div className="p-4 bg-white overflow-x-auto">
                                          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 select-none">
                                            <GripVertical className="w-3 h-3" />
                                            <span>اسحب الدروس لتغيير ترتيبها</span>
                                          </div>
                                          <table className="w-full text-right border-collapse min-w-[750px]">
                                            <thead>
                                              <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-black uppercase">
                                                <th className="pb-3 px-2 w-8"></th>
                                                <th className="pb-3 px-4 text-slate-500">اسم الدرس</th>
                                                <th className="pb-3 px-4 text-slate-500">رابط الفيديو</th>
                                                <th className="pb-3 px-4 text-slate-500">المرفقات والروابط</th>
                                                <th className="pb-3 px-4 text-slate-500">المشاهدات / الحد</th>
                                                <th className="pb-3 px-4 text-slate-500">الحالة</th>
                                                <th className="pb-3 px-4 text-center text-slate-500">التحكم</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                              {(chapterLessonOrder[ch.id] || ch.lessons).map((lesson) => (
                                                <tr
                                                  key={lesson.id}
                                                  draggable
                                                  onDragStart={() => {
                                                    dragLessonId.current = lesson.id;
                                                    setDraggingChapterId(ch.id);
                                                  }}
                                                  onDragEnter={() => {
                                                    dragOverLessonId.current = lesson.id;
                                                  }}
                                                  onDragEnd={() => handleDragEnd(ch.id, ch.lessons)}
                                                  onDragOver={(e) => e.preventDefault()}
                                                  className={`transition-colors group ${
                                                    draggingChapterId === ch.id && dragLessonId.current === lesson.id
                                                      ? "opacity-40 bg-[#FDF8F0]"
                                                      : "hover:bg-slate-50/50"
                                                  }`}
                                                >
                                                  {/* Drag Handle */}
                                                  <td className="py-3.5 px-2">
                                                    <GripVertical className="w-4 h-4 text-slate-300 hover:text-slate-500 transition-colors cursor-grab active:cursor-grabbing mx-auto" />
                                                  </td>

                                                  {/* Name */}
                                                  <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                      {lesson.banner ? (
                                                        <img src={lesson.banner} className="w-12 h-8 rounded-lg object-cover border border-slate-100 shadow-xs" alt="" />
                                                      ) : (
                                                        <div className="w-12 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center border border-slate-100 shadow-xs">
                                                          <LucideImage className="w-4 h-4" />
                                                        </div>
                                                      )}
                                                      <span className="font-bold text-sm text-slate-800 group-hover:text-[#C4963A] transition-colors">{lesson.name}</span>
                                                    </div>
                                                  </td>
                                                  
                                                  {/* Youtube Link */}
                                                  <td className="py-3.5 px-4 text-sm font-bold text-slate-600">
                                                    {lesson.youtubeLink ? (
                                                      <a
                                                        href={lesson.youtubeLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-[#C4963A] hover:text-[#b8872e] bg-[#FDF8F0] hover:bg-[#FBF0DC] px-3 py-1.5 rounded-lg text-xs transition-colors"
                                                      >
                                                        <Youtube className="w-4 h-4" />
                                                        مشاهدة الفيديو
                                                        <ExternalLink className="w-3 h-3" />
                                                      </a>
                                                    ) : (
                                                      <span className="text-slate-400 text-xs">لا يوجد</span>
                                                    )}
                                                  </td>

                                                  {/* Attachments & Links */}
                                                  <td className="py-3.5 px-4">
                                                    <div className="flex flex-col gap-1.5 items-start">
                                                      {(lesson.attachmentLink || lesson.attachment_link) && (
                                                        <a
                                                          href={lesson.attachmentLink || lesson.attachment_link}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg text-xs font-black transition-colors"
                                                        >
                                                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                                                          <span>{lesson.attachmentTitle || lesson.attachment_title || "رابط إضافي"}</span>
                                                        </a>
                                                      )}
                                                      {lesson.pdfFile ? (
                                                        <a
                                                          href={lesson.pdfFile}
                                                          download={`${lesson.name}.pdf`}
                                                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-black transition-colors"
                                                        >
                                                          <FileText className="w-4 h-4" />
                                                          ملف PDF
                                                        </a>
                                                      ) : !lesson.attachmentLink && !lesson.attachment_link && (
                                                        <span className="text-slate-400 text-xs font-bold">لا يوجد مرفق</span>
                                                      )}
                                                    </div>
                                                  </td>

                                                  {/* Views Counter */}
                                                  <td className="py-3.5 px-4 text-sm font-bold text-slate-600">
                                                    <div className="flex items-center gap-1.5">
                                                      <span className="px-2 py-0.5 bg-slate-100 rounded-md font-black text-slate-700 text-xs">{lesson.views || 0}</span>
                                                      <span className="text-slate-300">/</span>
                                                      <span className="px-2 py-0.5 bg-[#FDF8F0] text-[#C4963A] rounded-md font-black text-xs">{lesson.maxViews || 5}</span>
                                                    </div>
                                                  </td>

                                                  {/* Status */}
                                                  <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${lesson.status === "نشط" ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-500"}`}>
                                                      {lesson.status === "نشط" ? (
                                                        <>
                                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                                          نشط
                                                        </>
                                                      ) : (
                                                        <>
                                                          <XCircle className="w-3.5 h-3.5" />
                                                          غير نشط
                                                        </>
                                                      )}
                                                    </span>
                                                  </td>

                                                  {/* Actions */}
                                                  <td className="py-3.5 px-4 text-center">
                                                    <div className="inline-flex items-center gap-1.5">
                                                      <button 
                                                        onClick={() => handleEdit(lesson)}
                                                        className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100"
                                                        title="تعديل الدرس"
                                                      >
                                                        <Edit className="w-4 h-4" />
                                                      </button>
                                                      <button 
                                                        onClick={() => deleteLesson(lesson.id)}
                                                        className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:text-[#C4963A] hover:bg-[#FDF8F0] transition-all border border-slate-100"
                                                        title="حذف الدرس"
                                                      >
                                                        <Trash2 className="w-4 h-4" />
                                                      </button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

              {/* Unassigned Lessons Section */}
              {unassignedLessons.length > 0 && (
                <div className="bg-amber-50/50 rounded-[32px] border border-amber-200/60 p-6 lg:p-8 space-y-6 shadow-xs">
                  <div className="border-b border-amber-200/60 pb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-black text-lg shadow-xs border border-amber-200/50">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-amber-900">دروس بحاجة إلى تصنيف</h2>
                        <p className="text-amber-700/80 text-xs font-medium mt-0.5">دروس مدخلة في النظام ولكن لم يتم ربطها بشكل صحيح بباب أو مادة دراسية.</p>
                      </div>
                    </div>
                    <span className="px-3.5 py-1 bg-amber-100 text-amber-700 rounded-full font-black text-xs border border-amber-200">
                      {unassignedLessons.length} دروس معلقة
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-amber-200/50 overflow-hidden overflow-x-auto">
                    <table className="w-full text-right border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-black uppercase bg-slate-50/50">
                          <th className="py-3 px-4 text-slate-500">اسم الدرس المعلق</th>
                          <th className="py-3 px-4 text-slate-500">المرحلة / الصف / الباب</th>
                          <th className="py-3 px-4 text-slate-500">رابط الفيديو</th>
                          <th className="py-3 px-4 text-slate-500">المشاهدات</th>
                          <th className="py-3 px-4 text-slate-500">الحالة</th>
                          <th className="py-3 px-4 text-center text-slate-500">إجراءات التصنيف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {unassignedLessons.map((lesson) => (
                          <tr key={lesson.id} className="hover:bg-amber-50/20 transition-colors group">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                {lesson.banner ? (
                                  <img src={lesson.banner} className="w-12 h-8 rounded-lg object-cover border border-slate-100" alt="" />
                                ) : (
                                  <div className="w-12 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center border border-slate-100">
                                    <LucideImage className="w-4 h-4" />
                                  </div>
                                )}
                                <span className="font-bold text-sm text-slate-800">{lesson.name}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 inline-flex items-center gap-1.5">
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                                {getCategoryName(lesson.categoryId)} • {getClassName(lesson.classId)} • {getChapterName(lesson.chapterId)}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              {lesson.youtubeLink ? (
                                <a
                                  href={lesson.youtubeLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-[#C4963A] font-bold hover:underline"
                                >
                                  <Youtube className="w-4 h-4" />
                                  يوتيوب
                                </a>
                              ) : (
                                <span className="text-slate-400 text-xs">لا يوجد</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-xs font-bold text-slate-500">
                              {lesson.views || 0} / {lesson.maxViews || 5}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${lesson.status === "نشط" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                                {lesson.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleEdit(lesson)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-black border border-amber-200/50 transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  تصنيف الآن
                                </button>
                                <button
                                  onClick={() => deleteLesson(lesson.id)}
                                  className="p-2 bg-slate-50 text-slate-400 hover:text-[#C4963A] hover:bg-[#FDF8F0] rounded-xl border border-slate-100 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        // Grid Card View (Flat style, enriched with badges)
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-150 p-6 space-y-6">
          {displayedLessons.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-black">لا توجد دروس مطابقة لمعايير البحث الحالية.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors"
              >
                إعادة تعيين فلاتر البحث
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedLessons.map((lesson) => {
                const chapter = chapters.find(c => c.id === parseInt(lesson.chapterId));
                const courseName = getCourseNameByChapter(lesson.chapterId);
                const className = getClassName(lesson.classId);
                const categoryName = getCategoryName(lesson.categoryId);
                
                return (
                  <div key={lesson.id} className="group bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-500 flex flex-col justify-between">
                    <div>
                      {/* Banner / Card Header */}
                      <div className="relative h-48 overflow-hidden bg-slate-200">
                        {lesson.banner ? (
                          <img src={lesson.banner} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={lesson.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
                            <LucideImage className="w-12 h-12 stroke-[1.5]" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-[#C4963A] text-white p-2.5 rounded-xl shadow-lg border border-[#C4963A]/20">
                          <Youtube className="w-5 h-5" />
                        </div>
                        {/* Upper Badges */}
                        <div className="absolute bottom-4 right-4 left-4 flex flex-wrap gap-1.5">
                          <span className="text-[10px] font-black bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg">
                            {categoryName}
                          </span>
                          <span className="text-[10px] font-black bg-[#C4963A]/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg">
                            {className}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <span className="text-[10px] font-black text-[#C4963A] bg-[#FDF8F0] px-2.5 py-1 rounded-md border border-[#F0DDB8] inline-block mb-2">
                            {courseName}
                          </span>
                          <h3 className="text-xl font-black text-slate-800 line-clamp-2 leading-snug group-hover:text-[#C4963A] transition-colors">{lesson.name}</h3>
                        </div>

                        {/* Hierarchical badge */}
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{chapter?.name || "بدون باب أو فصل مركب"}</span>
                        </div>

                        {/* Counters */}
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-slate-400" />
                            شوهد {lesson.views || 0} مرات
                          </span>
                          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-black">
                            الحد: {lesson.maxViews || 5} مشاهدات
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-6 pt-0">
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-255/60">
                        <button 
                          onClick={() => handleEdit(lesson)}
                          className="p-2.5 bg-white text-slate-600 rounded-xl hover:text-blue-600 hover:bg-blue-50 hover:shadow-md transition-all border border-slate-100"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteLesson(lesson.id)}
                          className="p-2.5 bg-white text-slate-600 rounded-xl hover:text-[#C4963A] hover:bg-[#FDF8F0] hover:shadow-md transition-all border border-slate-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        
                        <div className="mr-auto flex items-center gap-2">
                          {(lesson.attachmentLink || lesson.attachment_link) && (
                            <ExternalLink className="w-5 h-5 text-emerald-500 stroke-[2.5]" title="يحتوي على رابط إضافي" />
                          )}
                          {lesson.pdfFile && (
                            <FileText className="w-5 h-5 text-blue-500 stroke-[2.5]" title="يحتوي على ملف PDF" />
                          )}
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${lesson.status === "نشط" ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-200/60 text-slate-500"}`}>
                            {lesson.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lesson Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] border border-white/20 animate-in fade-in zoom-in-95 duration-350 flex flex-col">
             {/* Header */}
             <div className="bg-slate-950 p-8 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-48 h-48 bg-[#C4963A]/10 rounded-full blur-3xl"></div>
                <div className="z-10">
                   <h3 className="text-2xl font-black">{editingLesson ? "تعديل بيانات الدرس" : "إضافة درس جديد لطلابك"}</h3>
                   <p className="text-slate-400 text-sm mt-1.5 font-medium">املأ الخيارات خطوة بخطوة لربط الدرس بالباب والمادة المناسبة.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="z-10 p-2 text-slate-400 hover:text-white transition-colors bg-slate-900 rounded-xl hover:scale-105 active:scale-95">
                   <Plus className="w-6 h-6 rotate-45 stroke-[3px]" />
                </button>
             </div>

             {/* Form body */}
             <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
                {/* Lesson Name */}
                <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 block pr-2">اسم الدرس</label>
                    <input
                        type="text"
                        placeholder="مثال: الدرس الأول - التيار الكهربي وقانون أوم"
                        className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-[#C4963A] focus:outline-none font-bold transition-all text-slate-700"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                    />
                </div>

                {/* Hierarchical Cascading Dropdowns */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                  <span className="text-xs font-black text-slate-500 block mb-1 pr-1">تحديد التصنيف والمكان الدراسي للدرس</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Stage Category Dropdown */}
                      <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 block pr-1">المرحلة الدراسية / الكورس</label>
                          <select
                              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-[#C4963A] focus:outline-none font-black text-sm bg-white cursor-pointer text-slate-700"
                              value={formData.categoryId}
                              onChange={handleModalCategoryChange}
                              required
                          >
                              <option value="">اختر الكورس / المرحلة...</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>

                      {/* Subject Course Dropdown */}
                      <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 block pr-1">المادة الدراسية</label>
                          <select
                              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-[#C4963A] focus:outline-none font-black text-sm bg-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-slate-700"
                              value={formData.courseId}
                              onChange={handleModalCourseChange}
                              disabled={!formData.categoryId}
                              required
                          >
                              <option value="">اختر المادة...</option>
                              {modalCoursesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>

                      {/* Chapter Dropdown */}
                      <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 block pr-1">الباب / الفصل الدراسي</label>
                          <select
                              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-[#C4963A] focus:outline-none font-black text-sm bg-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-slate-700"
                              value={formData.chapterId}
                              onChange={(e) => setFormData({...formData, chapterId: e.target.value})}
                              disabled={!formData.courseId}
                              required
                          >
                              <option value="">اختر الباب...</option>
                              {modalChaptersList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* YouTube Video URL */}
                  <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 block pr-2">رابط فيديو اليوتيوب</label>
                      <input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-[#C4963A] focus:outline-none font-bold transition-all text-slate-700"
                          value={formData.youtubeLink}
                          onChange={(e) => setFormData({...formData, youtubeLink: e.target.value})}
                          required
                      />
                  </div>

                  {/* Max Student Views */}
                  <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 block pr-2">حد المشاهدات لكل طالب</label>
                      <input
                          type="number"
                          min="1"
                          max="1000"
                          className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-[#C4963A] focus:outline-none font-bold transition-all text-slate-700"
                          value={formData.maxViews}
                          onChange={(e) => setFormData({...formData, maxViews: parseInt(e.target.value) || 5})}
                          required
                      />
                  </div>
                </div>

                {/* Image and PDF Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Banner Image */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 block pr-2">بانر الدرس / صورة مصغرة</label>
                        <ImageUpload 
                            value={formData.banner} 
                            onChange={(img) => setFormData({...formData, banner: img})} 
                        />
                    </div>
                    
                    {/* PDF Summary Document */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 block pr-2">ملخص أو ملزمة الدرس (ملف PDF)</label>
                        <div className="relative group/pdf h-[200px] border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer">
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                accept="application/pdf"
                                onChange={handlePdfUpload}
                            />
                            <FileText className="w-12 h-12 text-slate-300 mb-2 group-hover/pdf:text-blue-500 transition-colors" />
                            <span className="text-sm font-black text-slate-600 group-hover/pdf:text-blue-600 transition-colors">
                                {formData.pdfFile ? "تم اختيار ملف PDF بنجاح" : "اضغط لرفع ملف PDF هنا"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold mt-1">يقبل الملفات بصيغة PDF فقط</span>
                        </div>
                    </div>
                </div>

                {/* External Link Section (رابط يظهر تحت الفيديو للطالب) */}
                <div className="bg-[#FDF8F0]/70 border-2 border-[#C4963A]/25 p-6 rounded-[32px] space-y-4">
                  <div className="flex items-center gap-2 text-[#C4963A] font-black text-base">
                    <ExternalLink className="w-5 h-5 text-[#C4963A]" />
                    <span>رابط ملحق بالدرس يظهر تحت الفيديو للطالب (اختياري)</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold -mt-2 leading-relaxed">
                    ضع رابط امتحان إلكتروني (Google Form / Quiz)، أو رابط شيت واجب، أو رابط ملف Drive ليظهر كزر مباشر وأنيق للطالب تحت المشغل.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 block pr-1">رابط الصفحة (URL)</label>
                      <input
                        type="url"
                        placeholder="https://forms.gle/... أو https://drive.google.com/..."
                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-[#C4963A] focus:outline-none font-bold text-sm text-slate-700 bg-white"
                        value={formData.attachmentLink}
                        onChange={(e) => setFormData({ ...formData, attachmentLink: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 block pr-1">عنوان / نص الزر</label>
                      <input
                        type="text"
                        placeholder="مثال: رابط الامتحان الإلكتروني أو رابط الواجب"
                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-[#C4963A] focus:outline-none font-bold text-sm text-slate-700 bg-white"
                        value={formData.attachmentTitle}
                        onChange={(e) => setFormData({ ...formData, attachmentTitle: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Lesson Active Status Option */}
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="modalStatus"
                    className="w-5.5 h-5.5 accent-[#C4963A] rounded cursor-pointer"
                    checked={formData.status === "نشط"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "نشط" : "غير نشط" })}
                  />
                  <label htmlFor="modalStatus" className="text-sm font-black text-slate-700 cursor-pointer select-none">
                    تفعيل الدرس فوراً (يظهر للطلاب في حساباتهم)
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-[#C4963A] to-[#d4a84a] text-white font-black rounded-2xl shadow-xl shadow-[#E8C87A] hover:from-[#b8872e] hover:to-[#c4963a] transition-all">
                        {editingLesson ? "حفظ وتعديل الدرس" : "إضافة الدرس الآن"}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">
                        إلغاء
                    </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
