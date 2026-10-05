"use client";

import React from "react";
import { useGlobalStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { 
  User, 
  Settings, 
  BookOpen, 
  History, 
  LogOut, 
  GraduationCap, 
  Mail, 
  Phone, 
  Layout, 
  School, 
  ArrowRight, 
  TrendingUp, 
  Bell, 
  Trash2, 
  Clock 
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { currentUser, logoutUser, classes, categories, unlockedChapters, chapters: allChapters, courses, lessonViews, lessons, notifications, dismissedNotifications, dismissNotification } = useGlobalStore();
  const router = useRouter();

  const analytics = React.useMemo(() => {
    if (!currentUser) return null;
    
    // User specific data
    const myUnlocked = (unlockedChapters || []).filter(u => u.userId === currentUser.id);
    const myUnlockedChapterIds = myUnlocked.map(u => u.chapterId);
    
    const chapterObjects = (allChapters || []).filter(c => myUnlockedChapterIds.includes(c.id));
    const courseIds = new Set(chapterObjects.map(c => c.courseId));
    
    // Calculate total lessons in unlocked chapters
    const unlockedLessons = (lessons || []).filter(l => myUnlockedChapterIds.includes(l.chapterId));
    const totalLessonsCount = unlockedLessons.length;
    
    // Calculate watched lessons
    const watchedLessonIds = new Set((lessonViews || [])
      .filter(v => v.userId === currentUser.id)
      .map(v => v.lessonId));
    
    // Lessons that are both watched AND in unlocked chapters
    const watchedInUnlockedCount = unlockedLessons.filter(l => watchedLessonIds.has(l.id)).length;
    
    const progress = totalLessonsCount > 0 ? Math.round((watchedInUnlockedCount / totalLessonsCount) * 100) : 0;

    // View activity for last 7 days
    const last7Days = [];
    const today = new Date();
    for(let i=6; i>=0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('ar-EG', { weekday: 'short' });
        const dateStr = d.toDateString();
        const viewsCount = (lessonViews || [])
            .filter(v => v.userId === currentUser.id && new Date(v.timestamp).toDateString() === dateStr)
            .length;
        last7Days.push({ label: dayStr, value: viewsCount });
    }

    return {
        unlockedCount: myUnlocked.length,
        coursesCount: courseIds.size,
        progress,
        activity: last7Days
    };
  }, [currentUser, unlockedChapters, allChapters, lessons, lessonViews]);

  React.useEffect(() => {
    if (!currentUser && typeof window !== "undefined") {
      router.push("/login");
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  const userClass = classes.find(c => c.id === parseInt(currentUser.classId));
  const userCategory = categories.find(c => c.id === parseInt(currentUser.categoryId));
  const userUnlockedChapters = unlockedChapters.filter(u => u.userId === currentUser.id);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#F8F5F0] pt-24 lg:pt-32 pb-20" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#EAE3D6] text-center">
               <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="w-full h-full bg-gradient-to-br from-[#1B3668] to-[#2D559E] rounded-[32px] flex items-center justify-center text-white text-5xl font-black shadow-xl shadow-[#1B3668]/30 border-2 border-[#C4963A]/40">
                     {currentUser.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-[#C4963A] border border-[#EAE3D6]">
                     <Settings className="w-5 h-5" />
                  </div>
               </div>
               <h2 className="text-2xl font-black text-[#122040] mb-1">{currentUser.name}</h2>
               <p className="text-slate-500 font-bold text-sm mb-6">طالب في <span className="text-[#C4963A]">Bridge Academy</span></p>
               
               <div className="space-y-3 pt-6 border-t border-slate-100">
                  <button onClick={handleLogout} className="w-full py-3.5 flex items-center justify-center gap-2 bg-[#1B3668]/10 text-[#1B3668] hover:bg-[#1B3668] hover:text-white rounded-2xl font-bold transition-all">
                     <LogOut className="w-5 h-5" />
                     تسجيل الخروج
                  </button>
               </div>
            </div>

            <div className="bg-[#0F1A30] p-8 rounded-[40px] text-white space-y-4 border border-white/10 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                     <School className="w-5 h-5 text-[#C4963A]" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400">المرحلة الدراسية</p>
                     <p className="text-sm font-black">{userCategory?.name || "لم يحدد"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                     <GraduationCap className="w-5 h-5 text-[#C4963A]" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400">الصف الدراسي</p>
                     <p className="text-sm font-black">{userClass?.name || "لم يحدد"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                     <Mail className="w-5 h-5 text-[#C4963A]" />
                  </div>
                  <div className="truncate">
                     <p className="text-[10px] font-bold text-slate-400">البريد الإلكتروني</p>
                     <p className="text-sm font-black truncate">{currentUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                     <Phone className="w-5 h-5 text-[#C4963A]" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400">رقم الهاتف</p>
                     <p className="text-sm font-black">{currentUser.phone}</p>
                  </div>
                </div>
            </div>
          </div>

          {/* Main Content Areas */}
          <div className="lg:col-span-3 space-y-8">
             
             {/* Stats Bar */}
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-[32px] border border-[#EAE3D6] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                   <div className="w-12 h-12 bg-[#1B3668]/10 text-[#1B3668] rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-2xl font-black text-[#122040]">{analytics?.unlockedCount || 0}</p>
                      <p className="text-xs font-bold text-slate-400">أبواب مفعلة</p>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-[#EAE3D6] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                   <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <Layout className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-2xl font-black text-[#122040]">{analytics?.coursesCount || 0}</p>
                      <p className="text-xs font-bold text-slate-400">كورسات ملتحق بها</p>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-[#EAE3D6] shadow-sm flex items-center gap-4 col-span-2 sm:col-span-1 hover:shadow-md transition-shadow">
                   <div className="w-12 h-12 bg-[#C4963A]/15 text-[#C4963A] rounded-2xl flex items-center justify-center">
                      <History className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-2xl font-black text-[#122040]">{analytics?.progress || 0}%</p>
                      <p className="text-xs font-bold text-slate-400">نسبة الإنجاز</p>
                   </div>
                </div>
             </div>

             {/* Progress Analytics Chart */}
             <div className="bg-white rounded-[40px] shadow-sm border border-[#EAE3D6] p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                   <div>
                      <h3 className="text-xl font-black text-[#122040] flex items-center gap-2">
                         <TrendingUp className="w-6 h-6 text-[#1B3668]" />
                         تحليلات المستوى والنشاط
                      </h3>
                      <p className="text-slate-400 text-xs font-bold mt-1">رصد مستواك التعليمي خلال الأسبوع الماضي</p>
                   </div>
                   <div className="bg-[#C4963A]/15 px-4 py-2 rounded-xl text-[#A67822] font-black text-xs">
                      أنت متفوق بنسبة {analytics?.progress || 0}%
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {/* Left: Progress Ring */}
                   <div className="flex flex-col items-center justify-center p-6 bg-[#F8F5F0] rounded-[32px] border border-[#EAE3D6]">
                      <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                         <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                               style={{ strokeDasharray: 364.4, strokeDashoffset: 364.4 - (364.4 * (analytics?.progress || 0)) / 100 }}
                               className="text-[#1B3668] transition-all duration-1000" />
                         </svg>
                         <span className="absolute text-2xl font-black text-[#122040]">{analytics?.progress || 0}%</span>
                      </div>
                      <p className="text-sm font-bold text-slate-600 text-center">إجمالي التقدم في المنهج</p>
                   </div>

                   {/* Right: Activity Bars */}
                   <div className="space-y-4 flex flex-col justify-end h-full">
                      <div className="flex items-end justify-between h-32 gap-2">
                         {analytics?.activity?.map((day, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full">
                               <div className="w-full bg-slate-100 rounded-lg relative overflow-hidden flex-1 group">
                                  <div 
                                     className="absolute bottom-0 left-0 right-0 bg-[#1B3668] rounded-t-lg transition-all duration-500 group-hover:bg-[#C4963A]" 
                                     style={{ height: `${Math.min(100, (day.value / 10) * 100)}%` }}
                                  />
                               </div>
                               <span className="text-[10px] font-bold text-slate-400">{day.label}</span>
                            </div>
                         ))}
                      </div>
                      <p className="text-xs font-bold text-slate-500 text-center">عدد حصص المشاهدة اليومية</p>
                   </div>
                </div>
             </div>

             {/* Unlocked Chapters List */}
             <div className="bg-white rounded-[40px] shadow-sm border border-[#EAE3D6] overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                   <h3 className="text-xl font-black text-[#122040] flex items-center gap-2">
                      <History className="w-6 h-6 text-[#C4963A]" />
                      سجل تفعيل الأبواب
                   </h3>
                </div>
                <div className="p-4">
                   {userUnlockedChapters.length > 0 ? (
                      <div className="space-y-3">
                         {userUnlockedChapters.map((u, i) => {
                            const chapter = allChapters.find(ch => parseInt(ch.id) === parseInt(u.chapterId));
                            const course = chapter ? courses.find(crs => parseInt(crs.id) === parseInt(chapter.courseId)) : null;
                            return (
                               <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-[#F8F5F0] rounded-[32px] group hover:bg-slate-100 transition-all gap-4 border border-[#EAE3D6]">
                                  <div className="flex items-center gap-4 w-full">
                                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                                        <BookOpen className="w-7 h-7 text-slate-400 group-hover:text-[#1B3668] transition-colors" />
                                     </div>
                                     <div className="flex-1">
                                        <h4 className="font-black text-[#122040] text-lg">{chapter?.name || "باب غير معروف"}</h4>
                                        <p className="text-[11px] font-bold text-slate-500">{course?.name || "كورس غير معروف"}</p>
                                     </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8">
                                     <div className="text-right whitespace-nowrap">
                                        <p className="text-[10px] font-bold text-slate-400">تاريخ التفعيل</p>
                                        <p className="text-xs font-black text-slate-700">{new Date(u.unlockedAt).toLocaleDateString('ar-EG')}</p>
                                     </div>
                                     <Link 
                                        href={`/chapter/${u.chapterId}`}
                                        className="flex items-center gap-2 px-6 py-3 bg-[#1B3668] text-white text-sm font-bold rounded-2xl hover:bg-[#2D559E] transition-all shadow-sm"
                                     >
                                        تصفح الدروس
                                        <ArrowRight className="w-4 h-4 rotate-180 text-[#C4963A]" />
                                     </Link>
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   ) : (
                      <div className="text-center py-16">
                         <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                         <p className="text-slate-400 font-bold">لم تقم بتفعيل أي أبواب بعد</p>
                      </div>
                   )}
                </div>
             </div>

              {/* Notifications Section */}
              <div className="bg-white rounded-[40px] shadow-sm border border-[#EAE3D6] overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                   <h3 className="text-xl font-black text-[#122040] flex items-center gap-2">
                      <Bell size={24} className="text-[#C4963A]" />
                      التنبيهات والإشعارات
                   </h3>
                </div>
                <div className="p-6">
                   {notifications.filter(notif => {
                        const isDismissed = dismissedNotifications.some(d => d.notificationId === notif.id && d.userId === currentUser.id);
                        if (isDismissed) return false;
                        if (notif.targetType === "all") return true;
                        if (notif.targetType === "category" && notif.categoryId === currentUser.categoryId) return true;
                        if (notif.targetType === "class" && notif.classId === currentUser.classId) return true;
                        return false;
                   }).length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {notifications.filter(notif => {
                                const isDismissed = dismissedNotifications.some(d => d.notificationId === notif.id && d.userId === currentUser.id);
                                if (isDismissed) return false;
                                if (notif.targetType === "all") return true;
                                if (notif.targetType === "category" && notif.categoryId === currentUser.categoryId) return true;
                                if (notif.targetType === "class" && notif.classId === currentUser.classId) return true;
                                return false;
                           }).map(notif => (
                               <div key={notif.id} className="p-6 bg-[#F8F5F0] rounded-[32px] border border-[#EAE3D6] relative group transition-all hover:bg-white hover:shadow-md">
                                   <div className="flex justify-between items-start mb-3">
                                       <h4 className="font-black text-[#122040] leading-tight">{notif.title}</h4>
                                       <button 
                                            onClick={() => dismissNotification(currentUser.id, notif.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 rounded-xl transition-all"
                                            title="حذف الإشعار"
                                       >
                                            <Trash2 size={16} />
                                       </button>
                                   </div>
                                   <p className="text-slate-500 text-sm leading-relaxed mb-4">{notif.message}</p>
                                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                       <Clock size={12} className="text-[#C4963A]" />
                                       {new Date(notif.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                   </div>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="text-center py-12">
                           <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                           <p className="text-slate-400 font-bold text-sm">لا يوجد إشعارات نشطة حالياً</p>
                       </div>
                   )}
                </div>
              </div>

          </div>

        </div>

      </div>
    </main>
  );
}
