"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Settings, 
  Maximize, 
  Volume2, 
  Play, 
  Pause,
  FileText,
  Download,
  ShieldCheck,
  Eye
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";

// Extract Youtube ID
const getYoutubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function LessonDetailPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const lessonId = parseInt(unwrappedParams.lessonId, 10);

  const { lessons, chapters, currentUser, unlockedChapters, lessonViews, viewCounts, incrementLessonView, verifyAndUseCode, isLoaded } = useGlobalStore();

  const lesson = lessons.find(l => l.id === lessonId);
  const chapter = lesson ? chapters.find(c => c.id === parseInt(lesson.chapterId)) : null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkPos, setWatermarkPos] = useState({ top: 10, left: 10 });
  const [redeemCode, setRedeemCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // SECURITY: currentUser is ALWAYS required — even free lessons need a login
  // "free" only means no code is needed, NOT that anyone can watch without an account
  const isUnlocked = !!currentUser && !!chapter && (
    (unlockedChapters || []).some(u => u.userId === currentUser.id && u.chapterId === chapter.id) ||
    Number(chapter.price || 0) === 0
  );
  const userView = (viewCounts || []).find(v => v.userId === currentUser?.id && v.lessonId === lessonId);
  const currentViews = userView ? userView.count : 0;
  const maxViews = lesson?.maxViews || 5;

  const handleRedeemCode = async (e) => {
    e.preventDefault();
    if (!redeemCode || !currentUser) return;
    setIsRedeeming(true);
    const result = await verifyAndUseCode(redeemCode, currentUser.id);
    if (result.success) {
        setRedeemCode("");
        // Refresh so isUnlocked re-evaluates → video appears automatically
        router.refresh();
    } else {
        alert(result.message);
    }
    setIsRedeeming(false);
  };

  // YouTube API Integration for Custom Player
  const [player, setPlayer] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [currentQuality, setCurrentQuality] = useState("");
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!lessonId || !lesson?.youtubeLink || !isUnlocked) return;

    // Load YouTube API script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const checkAndInit = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        window.onYouTubeIframeAPIReady = () => initPlayer();
      }
    };

    checkAndInit();

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); playerRef.current = null; } catch(e) {}
      }
    };
  }, [lessonId, lesson?.youtubeLink, isUnlocked]);

  const initPlayer = () => {
    if (!lesson?.youtubeLink || !isUnlocked) return;
    const videoId = getYoutubeID(lesson.youtubeLink);
    if (!videoId) return;

    // Clean up existing player before re-init
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch(e) {}
    }

    const newPlayer = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        fs: 1,
        disablekb: 1,
      },
      events: {
        onReady: (event) => {
          setPlayer(event.target);
          playerRef.current = event.target;
          setDuration(event.target.getDuration());
          setQualityLevels(event.target.getAvailableQualityLevels());
          setCurrentQuality(event.target.getPlaybackQuality());
        },
        onStateChange: (event) => {
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          if (event.data === window.YT.PlayerState.PLAYING || event.data === window.YT.PlayerState.BUFFERING) {
            const levels = event.target.getAvailableQualityLevels();
            if (levels && levels.length > 0) {
              setQualityLevels(levels);
              setCurrentQuality(event.target.getPlaybackQuality());
            }
          }
        }
      }
    });
  };

  // Update progress bar
  useEffect(() => {
    if (isPlaying && player && duration > 0) {
      const interval = setInterval(() => {
        try {
            const curr = player.getCurrentTime();
            setProgress((curr / duration) * 100);
        } catch(e) {}
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, player, duration]);

  useEffect(() => {
    if (player) {
      player.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed, player]);

  useEffect(() => {
    if (isUnlocked && currentUser && lessonId) {
      // Increment view only if under limit
      if (currentViews < maxViews) {
         incrementLessonView(currentUser.id, lessonId);
      }
    }
  }, [isUnlocked, lessonId]);

  // Moving Watermark Effect
  useEffect(() => {
    if (isUnlocked) {
        const interval = setInterval(() => {
            setWatermarkPos({
                top: Math.floor(Math.random() * 80) + 10,
                left: Math.floor(Math.random() * 80) + 10
            });
        }, 5000);
        return () => clearInterval(interval);
    }
  }, [isUnlocked]);

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying && showControls) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showControls]);

  // Anti-Theft Security: Prevent copy, right-click, and Inspect Element, and detect DevTools
  useEffect(() => {
    if (!isUnlocked) return;

    const preventRightClick = (e) => {
      e.preventDefault();
    };

    const preventCopy = (e) => {
      e.preventDefault();
    };

    const preventInspect = (e) => {
      // Disable F12 (Inspect), Ctrl+Shift+I (DevTools), Ctrl+Shift+C (Inspect), Ctrl+Shift+J (Console), Ctrl+U (Source), Ctrl+S (Save)
      if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 67 || e.keyCode === 74)) || 
        (e.ctrlKey && e.keyCode === 85) || 
        (e.ctrlKey && e.keyCode === 83)
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("keydown", preventInspect);
    document.addEventListener("copy", preventCopy);
    document.addEventListener("selectstart", preventCopy);

    // DevTools Detection
    let isDevToolsOpen = false;
    const threshold = 160;
    
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      const orientation = widthThreshold ? 'vertical' : 'horizontal';

      if (
        (heightThreshold && orientation === 'horizontal') ||
        (widthThreshold && orientation === 'vertical')
      ) {
        if (!isDevToolsOpen) {
          isDevToolsOpen = true;
          setDevToolsOpen(true);
          if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
            playerRef.current.pauseVideo();
          }
        }
      } else {
        if (isDevToolsOpen) {
          isDevToolsOpen = false;
          setDevToolsOpen(false);
        }
      }
    };

    // Run check regularly
    const interval = setInterval(checkDevTools, 1000);

    // Also listen to window resize
    window.addEventListener("resize", checkDevTools);
    
    return () => {
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("keydown", preventInspect);
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("selectstart", preventCopy);
      clearInterval(interval);
      window.removeEventListener("resize", checkDevTools);
    };
  }, [isUnlocked]);

  const handleTouchPlayer = () => {
    setShowControls(prev => !prev);
  };

  // ── 1. Loading state ─────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950" dir="rtl">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── 2. Not logged in → show register / login gate ────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" dir="rtl">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-red-700/10 blur-[130px] rounded-full" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[100px] rounded-full" />
        </div>
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-[#C4963A]/10 border border-[#C4963A]/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-12 h-12 text-[#C4963A]" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">محتوى حصري</h1>
          <p className="text-slate-400 font-bold mb-2">هذا الدرس متاح لطلاب Bridge Academy فقط</p>
          <p className="text-slate-500 text-sm mb-10">يجب تسجيل الدخول أو إنشاء حساب للتمكن من مشاهدة المحاضرات</p>
          <div className="space-y-4">
            <Link
              href="/login"
              className="flex items-center justify-center gap-3 w-full py-4 bg-[#C4963A] hover:bg-[#A87C24] text-white font-black text-lg rounded-2xl shadow-xl shadow-[#C4963A]/20 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              سجل دخولك وابدأ التعلم
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-base rounded-2xl transition-all"
            >
              معكش حساب؟ أنشئ حسابك مجاناً الآن
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !chapter) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white" dir="rtl">
            <div className="text-center">
                <p className="text-xl font-bold mb-4">الدرس غير موجود</p>
                <button onClick={() => router.back()} className="px-6 py-2 bg-red-600 rounded-xl font-bold">رجوع</button>
            </div>
        </div>
    );
  }

  // ── 4. Logged in but chapter is locked (paid) → show code entry ──────────
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" dir="rtl">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-red-700/10 blur-[130px] rounded-full" />
        </div>
        <div className="w-full max-w-md">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 to-rose-700 p-8 text-center">
              <div className="w-16 h-16 bg-white/15 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white">هذا الباب مدفوع</h1>
              <p className="text-red-200 text-sm mt-1 font-bold">
                {chapter?.name || "الباب"}
              </p>
            </div>

            {/* Body */}
            <div className="p-8">
              <p className="text-slate-400 text-center font-bold mb-6">
                أدخل كود التفعيل الخاص بك لفتح هذا الباب والوصول لجميع دروسه
              </p>
              <form onSubmit={handleRedeemCode} className="space-y-4">
                <input
                  type="text"
                  placeholder="مثال: A1B2C3D4"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border-2 border-white/10 focus:border-red-500 rounded-2xl py-4 px-6 text-center text-2xl font-mono font-black text-red-400 focus:outline-none transition-all placeholder:text-slate-700 tracking-widest"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isRedeeming}
                  className="w-full py-4 bg-gradient-to-r from-[#C4963A] to-[#D4A84A] hover:from-[#A87C24] hover:to-[#C4963A] text-white font-black rounded-2xl shadow-lg shadow-[#C4963A]/20 transition-all disabled:opacity-50 text-lg"
                >
                  {isRedeeming ? "جاري التحقق..." : "فتح الباب وابدأ التعلم ←"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/5 text-center">
                <p className="text-slate-600 text-xs font-bold mb-3">مجاني إدخال الكود • بدون اشتراك شهري</p>
                <button onClick={() => router.back()} className="text-slate-500 hover:text-white text-sm font-bold transition-colors">
                  ← العودة للخلف
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentViews >= maxViews) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-8 text-center" dir="rtl">
            <div className="max-w-md w-full">
                <div className="w-24 h-24 bg-[#C4963A]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C4963A]/20">
                    <Eye className="w-12 h-12 text-[#C4963A]" />
                </div>
                <h1 className="text-3xl font-black mb-4">انتهت عدد المشاهدات</h1>
                <p className="text-slate-400 mb-8 font-bold">لقد استنفدت الحد الأقصى لمشاهدة هذا الفيديو ({maxViews} مشاهدات). يمكنك إدخال كود جديد لتجديد المشاهدات.</p>
                
                <form onSubmit={handleRedeemCode} className="space-y-4 mb-8">
                    <input 
                        type="text" 
                        placeholder="ادخل كود التجديد هنا..." 
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-center text-xl font-mono font-black text-[#C4963A] focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50 transition-all placeholder:text-slate-600"
                        required
                    />
                    <button 
                        type="submit" 
                        disabled={isRedeeming}
                        className="w-full py-4 bg-gradient-to-r from-[#C4963A] to-[#D4A84A] rounded-2xl font-black shadow-lg shadow-[#C4963A]/20 hover:from-[#A87C24] hover:to-[#C4963A] transition-all disabled:opacity-50"
                    >
                        {isRedeeming ? "جاري التحقق..." : "تفعيل وشحن المشاهدات الآن"}
                    </button>
                </form>

                <button onClick={() => router.back()} className="text-slate-500 hover:text-white font-bold transition-colors">العودة للخلف</button>
            </div>
        </div>
    );
  }

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
      setShowControls(true);
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (!player) return;
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    player.seekTo(newTime, true);
    setProgress(newProgress);
  };

  const toggleFullScreen = (e) => {
    if (e) e.stopPropagation();
    if (!containerRef.current) return;
    
    const isActuallyFull = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    
    if (!isActuallyFull) {
      if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen();
      else if (containerRef.current.webkitRequestFullscreen) containerRef.current.webkitRequestFullscreen();
      else if (containerRef.current.msRequestFullscreen) containerRef.current.msRequestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.error("Exit fullscreen error", err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const val = parseInt(e.target.value);
    setVolume(val);
    if (player) {
      player.setVolume(val);
      player.unMute();
      setIsMuted(val === 0);
    }
  };

  const handleQualityChange = (e, q) => {
    e.stopPropagation();
    if (player) {
      player.setPlaybackQuality(q);
      setCurrentQuality(q);
    }
  };




  return (
    <main className="min-h-screen bg-[#0f172a] text-white pt-24 lg:pt-32 pb-20 select-none" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 lg:grid lg:grid-cols-3 gap-8">
        
        {/* Left: Video Player & PDF (Col-Span 2) */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                 </button>
                 <div>
                    <h1 className="text-2xl font-black">{lesson.name}</h1>
                    <p className="text-slate-400 text-sm font-bold">{chapter.name}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 text-xs font-black">
                 <ShieldCheck className="w-4 h-4" />
                 اتصال آمن بمتصفح خاص
              </div>
           </div>

           {/* Custom Premium Video Player */}
           <div ref={containerRef} className="relative aspect-video bg-black rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl border border-white/5 group/player z-[2000]">
              <div id="youtube-player" className="w-full h-full pointer-events-none"></div>

              {/* Watermark Overlay */}
              <div 
                className="absolute pointer-events-none text-white/20 text-[8px] md:text-sm font-black select-none z-50 transition-all duration-1000 ease-in-out whitespace-nowrap text-center"
                style={{ top: `${watermarkPos.top}%`, left: `${watermarkPos.left}%` }}
              >
                {currentUser?.name} <br /> {currentUser?.phone} <br /> {new Date().toLocaleTimeString('ar-EG')}
              </div>

              {/* Custom Controls Overlay */}
               {/* DevTools Warning Overlay */}
               {devToolsOpen && (
                 <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-center p-6 select-none" onContextMenu={(e) => e.preventDefault()}>
                   <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-red-500 animate-pulse mb-4" />
                   <h3 className="text-lg md:text-2xl font-black text-white mb-2">تم رصد أدوات المطور (DevTools)</h3>
                   <p className="text-slate-400 text-xs md:text-sm font-bold max-w-sm">
                     يرجى إغلاق أدوات المطور للمتابعة. حماية المحتوى مفعلة لحفظ حقوق الملكية الفكرية.
                   </p>
                 </div>
               )}

               <div className="absolute inset-0 bg-transparent z-[40]" onContextMenu={(e) => e.preventDefault()} onClick={handleTouchPlayer}>
                 {/* Protection Layer covers the center to prevent direct iframe clicks, but controls are accessible */}
                 <div className="absolute inset-0 bg-transparent"></div>

                 {/* Play/Pause Large indicator on tap */}
                 {!showControls && isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-20 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 animate-ping">
                           <Play className="w-10 h-10 text-white fill-current" />
                        </div>
                    </div>
                 )}

                 {/* Controls Bar */}
                 <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 md:p-6 transition-all duration-300 z-[60] ${showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                    
                    {/* Progress Bar */}
                    <div className="mb-3 md:mb-4 relative group/progress">
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={progress}
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#C4963A] transition-all group-hover/progress:h-2"
                        />
                        <div className="absolute top-1/2 left-0 h-1.5 bg-[#C4963A] rounded-full pointer-events-none group-hover/progress:h-2 -translate-y-1/2" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 md:gap-6">
                            <button onClick={togglePlay} className="text-white hover:text-[#C4963A] transition-colors transform active:scale-90">
                                {isPlaying ? <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" /> : <Play className="w-6 h-6 md:w-8 md:h-8 fill-current" />}
                            </button>
                            
                            <div className="hidden sm:flex items-center gap-3 group/volume">
                                <Volume2 className="w-5 h-5 text-white/70" />
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-16 lg:w-32 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                />
                            </div>

                            <div className="text-white/70 text-[10px] md:text-sm font-bold font-mono">
                                {player ? Math.floor(player.getCurrentTime() / 60) : "00"}:
                                {player ? String(Math.floor(player.getCurrentTime() % 60)).padStart(2, '0') : "00"} 
                                <span className="hidden md:inline"> / </span>
                                <span className="hidden md:inline">
                                    {player ? Math.floor(duration / 60) : "00"}:
                                    {player ? String(Math.floor(duration % 60)).padStart(2, '0') : "00"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Quality Selector */}
                            <div className="flex gap-1 px-1.5 py-1 bg-white/10 rounded-xl backdrop-blur-md border border-white/5 overflow-x-auto max-w-[80px] md:max-w-none">
                                {qualityLevels && qualityLevels.length > 0 ? (
                                    qualityLevels.filter(q => q !== 'auto').slice(0, 4).map(q => (
                                        <button 
                                            key={q}
                                            onClick={(e) => handleQualityChange(e, q)}
                                            className={`px-1.5 h-6 rounded-lg text-[8px] md:text-[10px] font-black transition-all flex-shrink-0 ${currentQuality === q ? "bg-[#C4963A] text-white shadow-lg" : "text-white/50 hover:text-white"}`}
                                        >
                                            {q.replace('hd', '').replace('small', '240p').replace('medium', '360p').replace('large', '480p')}
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-[8px] px-1 text-white/30 font-bold">جاري...</div>
                                )}
                            </div>

                            <div className="flex gap-1 px-1.5 py-1 bg-white/10 rounded-xl backdrop-blur-md border border-white/5">
                                {[1, 1.5, 2].map(s => (
                                    <button 
                                        key={s}
                                        onClick={(e) => { e.stopPropagation(); setPlaybackSpeed(s); }}
                                        className={`w-7 h-6 rounded-lg text-[8px] md:text-[10px] font-black transition-all ${playbackSpeed === s ? "bg-[#C4963A] text-white shadow-lg" : "text-white/50 hover:text-white"}`}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                            <button onClick={toggleFullScreen} className="text-white/70 hover:text-white transition-colors p-1">
                                <Maximize className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Lesson Assets */}
           <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px]">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-black flex items-center gap-2">
                    <FileText className="w-6 h-6 text-[#C4963A]" />
                    المصادر الملحقة بالدرس
                 </h3>
                 {lesson.pdfFile && (
                    <a 
                      href={lesson.pdfFile} 
                      download={`${lesson.name}-fahem.pdf`}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm font-bold border border-white/10"
                    >
                       <Download className="w-4 h-4" />
                       تحميل PDF
                    </a>
                 )}
              </div>
              
              {lesson.pdfFile ? (
                <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
                   <div className="w-12 h-12 bg-[#C4963A]/20 rounded-xl flex items-center justify-center text-[#C4963A]">
                      <FileText className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                      <p className="font-bold">ملخص المحاضرة والخرائط الذهنية</p>
                      <p className="text-xs text-slate-500">اضغط للتحميل أو العرض</p>
                   </div>
                    <a 
                      href={lesson.pdfFile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors"
                    >
                      عرض
                    </a>
                </div>
              ) : (
                <p className="text-slate-500 font-bold text-center py-4">لا توجد ملفات مرفقة لهذا الدرس</p>
              )}
           </div>
        </div>

        {/* Right: Sidebar Info */}
        <div className="mt-8 lg:mt-0 space-y-6">
           <div className="bg-gradient-to-br from-[#1B3668] to-[#122040] border border-[#C4963A]/30 p-8 rounded-[40px] shadow-xl shadow-black/40 relative overflow-hidden">
              <div className="relative z-10">
                 <h2 className="text-2xl font-black mb-2 text-white">معلومات المشاهدة</h2>
                 <p className="text-[#C4963A] text-sm mb-6 font-bold">احرص على التركيز أثناء الشرح</p>
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                       <span className="text-sm font-bold opacity-70">عدد المشاهدات</span>
                       <span className="font-black text-xl">{currentViews}/{maxViews}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                       <span className="text-sm font-bold opacity-70">سرعة التشغيل</span>
                       <div className="flex gap-2">
                          {[1, 1.25, 1.5, 2].map(s => (
                             <button 
                                key={s}
                                onClick={() => setPlaybackSpeed(s)}
                                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${playbackSpeed === s ? "bg-[#C4963A] text-white shadow-lg" : "bg-black/20 hover:bg-black/30"}`}
                             >
                                {s}x
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
           </div>

           <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] space-y-6">
              <h3 className="text-lg font-black flex items-center gap-2">
                 <Eye className="w-5 h-5 text-blue-400" />
                 تعليمات هامة
              </h3>
              <ul className="space-y-4 text-sm font-bold text-slate-400 list-disc pr-4">
                 <li>يمنع منعاً باتاً تصوير الشاشة أو محاولة تسجيل الفيديو.</li>
                 <li>كافة الفيديوهات مراقبة ومحمية بعلامات مائية شخصية.</li>
                 <li>سيتم حظر أي حساب يشارك بيانات دخوله مع الآخرين.</li>
                 <li>يمكنك تحميل ملخص الدرس فقط ولا يمكن تحميل الفيديو.</li>
              </ul>
           </div>
        </div>

      </div>
    </main>
  );
}
