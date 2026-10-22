"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

// Create the Context
const GlobalContext = createContext(null);

const defaultData = {
  categories: [],
  teachers: [],
  classes: [],
  courses: [],
  chapters: [],
  lessons: [],
  codes: [],
  users: [],
  currentUser: null,
  currentParent: null,
  currentTeacher: null,
  unlockedChapters: [],
  unlockedCourses: [],
  lessonViews: [],
  viewCounts: [],
  notifications: [],
  dismissedNotifications: [],
  // Teacher files
  teacherFiles: [],
  // Quiz system
  examBanks: [],
  examQuestions: [],
  examChoices: [],
  lessonQuizzes: [],
  quizAttempts: [],
  certificates: [],
};

// Helper to convert snake_case object to camelCase
const toCamel = (obj) => {
  if (!obj) return obj;
  const newObj = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
};

// Helper to convert camelCase object to snake_case
const toSnake = (obj) => {
  if (!obj) return obj;
  const newObj = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  return newObj;
};

// Helper to safely fetch and parse JSON without crashing on HTML (404/500/redirect) responses
const safeJsonFetch = async (url, options) => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return { ok: false, status: res.status, data: null, isHtml: true };
    }
    const data = await res.json();
    return { ok: res.ok, status: res.status, data, isHtml: false };
  } catch (err) {
    return { ok: false, status: 0, data: null, isHtml: false, error: err };
  }
};


export const GlobalProvider = ({ children }) => {
  const [data, setData] = useState(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withLoading = async (action) => {
    setIsSubmitting(true);
    try {
      return await action();
    } catch (err) {
      console.error("Action error:", err);
      alert("حدث خطأ أثناء العملية، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extracted fetchData so it can be called from anywhere (e.g., after code verification)
  const fetchData = React.useCallback(async () => {
    try {
      const [
        { data: categories },
        { data: teachers },
        { data: classes },
        { data: courses },
        { data: chapters },
        { data: lessons },
        { data: codes },
        { data: users },
        { data: unlockedChapters },
        { data: lessonViews },
        { data: viewCounts },
        { data: notifications },
        { data: dismissedNotifications },
      ] = await Promise.all([
        supabase.from("categories").select("*"),
        supabase.from("teachers").select("*"),
        supabase.from("classes").select("*"),
        supabase.from("courses").select("*"),
        supabase.from("chapters").select("*"),
        supabase.from("lessons").select("*").order("id", { ascending: true }),
        supabase.from("codes").select("*"),
        // SECURITY: password field is intentionally excluded — never sent to client
        supabase.from("users").select("id, name, phone, email, role, status, class_id, category_id, parent_phone, whatsapp, parent_whatsapp, school_name, religion, gender, birth_date, notes, father_job, father_phone, discount_code, national_id, max_devices, created_at"),
        supabase.from("unlocked_chapters").select("*"),
        supabase.from("lesson_views").select("*"),
        supabase.from("view_counts").select("*"),
        supabase.from("notifications").select("*"),
        supabase.from("dismissed_notifications").select("*"),
      ]);

      // Unlocked courses data
      let unlockedCoursesData = [];
      try {
        const { data: uc } = await supabase.from("unlocked_courses").select("*");
        unlockedCoursesData = uc || [];
      } catch (ucErr) {
        // unlocked_courses table might not be created yet in DB
      }

      // Quiz system data (separate to avoid breaking main load if tables don't exist yet)
      let examBanksData = [], examQuestionsData = [], examChoicesData = [];
      let lessonQuizzesData = [], quizAttemptsData = [], certificatesData = [];
      let teacherFilesData = [];
      try {
        const [eb, eq, ec, lq, qa, cert, tf] = await Promise.all([
          supabase.from("exam_banks").select("*"),
          supabase.from("exam_questions").select("*").order("sort_order", { ascending: true }),
          supabase.from("exam_choices").select("*").order("sort_order", { ascending: true }),
          supabase.from("lesson_quizzes").select("*"),
          supabase.from("quiz_attempts").select("*").order("created_at", { ascending: false }),
          supabase.from("certificates").select("*"),
          supabase.from("teacher_files").select("*").order("created_at", { ascending: false }),
        ]);
        examBanksData = eb.data || [];
        examQuestionsData = eq.data || [];
        examChoicesData = ec.data || [];
        lessonQuizzesData = lq.data || [];
        quizAttemptsData = qa.data || [];
        certificatesData = cert.data || [];
        teacherFilesData = tf.data || [];
      } catch (quizErr) {
        console.warn("Quiz/Teacher tables not yet created", quizErr);
      }

      const savedUser = localStorage.getItem("fahemCurrentUser");
      const savedParent = localStorage.getItem("fahemCurrentParent");
      const savedTeacher = localStorage.getItem("fahemCurrentTeacher");
      let parsedUser = null;
      let parsedParent = null;
      let parsedTeacher = null;
      if (savedUser) {
         try { parsedUser = JSON.parse(savedUser); } catch(e){}
      }
      if (savedParent) {
         try { parsedParent = JSON.parse(savedParent); } catch(e){}
      }
      if (savedTeacher) {
         try { parsedTeacher = JSON.parse(savedTeacher); } catch(e){}
      }

      setData((prev) => ({
        ...prev,
        categories: categories?.map(toCamel) || [],
        teachers: teachers?.map(toCamel) || [],
        classes: classes?.map(toCamel) || [],
        courses: (courses?.map(toCamel) || []).map(crs => {
          const matchingClass = (classes || []).find(c => c.id === crs.classId);
          const primaryCat = crs.categoryId || (matchingClass ? matchingClass.category_id || matchingClass.categoryId : null);
          let catIds = [];
          if (Array.isArray(crs.categoryIds)) {
            catIds = crs.categoryIds;
          } else if (Array.isArray(crs.category_ids)) {
            catIds = crs.category_ids;
          } else if (crs.category_ids) {
            try {
              catIds = typeof crs.category_ids === "string" ? JSON.parse(crs.category_ids) : crs.category_ids;
            } catch (e) {
              catIds = [];
            }
          }
          if (primaryCat && !catIds.includes(primaryCat)) {
            catIds = [primaryCat, ...catIds];
          }
          return {
            ...crs,
            categoryId: primaryCat,
            categoryIds: catIds.length > 0 ? catIds : (primaryCat ? [primaryCat] : [])
          };
        }),
        chapters: chapters?.map(toCamel) || [],
        lessons: (lessons?.map(toCamel) || []).sort((a, b) => {
          const orderA = a.sortOrder !== undefined && a.sortOrder !== null ? a.sortOrder : a.id;
          const orderB = b.sortOrder !== undefined && b.sortOrder !== null ? b.sortOrder : b.id;
          return orderA - orderB;
        }),
        codes: codes?.map(toCamel) || [],
        users: users?.map(toCamel) || [],
        unlockedChapters: unlockedChapters?.map(toCamel) || [],
        unlockedCourses: unlockedCoursesData.map(toCamel),
        lessonViews: lessonViews?.map(toCamel) || [],
        viewCounts: viewCounts?.map(toCamel) || [],
        notifications: notifications?.map(toCamel) || [],
        dismissedNotifications: dismissedNotifications?.map(toCamel) || [],
        currentUser: parsedUser,
        currentParent: parsedParent,
        currentTeacher: parsedTeacher,
        teacherFiles: teacherFilesData.map(toCamel),
        // Quiz system
        examBanks: examBanksData.map(toCamel),
        examQuestions: examQuestionsData.map(toCamel),
        examChoices: examChoicesData.map(toCamel),
        lessonQuizzes: lessonQuizzesData.map(toCamel),
        quizAttempts: quizAttemptsData.map(toCamel),
        certificates: certificatesData.map(toCamel),
      }));

      setIsLoaded(true);
    } catch (e) {
      console.error("Error fetching data", e);
      setIsLoaded(true);
    }
  }, []);

  // Load from Supabase on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save currentUser to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      if (data.currentUser) {
        localStorage.setItem("fahemCurrentUser", JSON.stringify(data.currentUser));
      } else {
        localStorage.removeItem("fahemCurrentUser");
      }
    }
  }, [data.currentUser, isLoaded]);

  // Session heartbeat: Check if session was terminated by another device or admin
  useEffect(() => {
    if (!data.currentUser || data.currentUser.role === "admin") return;
    const token = typeof window !== "undefined" ? localStorage.getItem("fahemSessionToken") : null;
    if (!token) return;

    let isMounted = true;
    const verifySession = async () => {
      try {
        const { ok, data: result } = await safeJsonFetch("/api/auth/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.currentUser.id,
            sessionToken: token,
          }),
        });
        if (ok && isMounted && result && result.valid === false) {
          localStorage.removeItem("fahemCurrentUser");
          localStorage.removeItem("fahemSessionToken");
          setData((prev) => ({ ...prev, currentUser: null }));
          alert(result.message || "تم تسجيل الخروج لأن حسابك تم فتحه من جهاز آخر.");
          window.location.href = "/login";
        }
      } catch (_) {
        // Silently ignore temporary network errors
      }
    };

    // Heartbeat check every 15 seconds
    const intervalId = setInterval(verifySession, 15000);

    // Verify when the user returns to this tab
    const handleFocus = () => {
      verifySession();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [data.currentUser]);

  // --- Auth Actions ---
  const adminAddUser = async (user) => {
    // Phone validation: 11 digits, starts with 01
    const phoneRegex = /^01[0-9]{9}$/;
    if (!user.phone || !phoneRegex.test(user.phone)) {
      return { success: false, message: "رقم الهاتف غير صالح، يجب أن يتكون من 11 رقماً ويبدأ بـ 01" };
    }

    // WhatsApp validation (if provided)
    if (user.whatsapp && !phoneRegex.test(user.whatsapp)) {
      return { success: false, message: "رقم الواتساب غير صالح، يجب أن يتكون من 11 رقماً ويبدأ بـ 01" };
    }

    // National ID validation (if provided)
    const nationalIdRegex = /^[0-9]{14}$/;
    if (user.nationalId && !nationalIdRegex.test(user.nationalId)) {
      return { success: false, message: "الرقم القومي غير صالح، يجب أن يتكون من 14 رقماً (أرقام فقط)" };
    }

    const exists = data.users.find(
      (u) =>
        (user.email && u.email === user.email) ||
        u.phone === user.phone ||
        (user.nationalId && u.nationalId && u.nationalId === user.nationalId)
    );
    if (exists) {
      if (exists.phone === user.phone) {
        return { success: false, message: "رقم الهاتف موجود بالفعل" };
      }
      if (user.nationalId && exists.nationalId === user.nationalId) {
        return { success: false, message: "الرقم القومي موجود بالفعل" };
      }
      return { success: false, message: "البريد الإلكتروني موجود بالفعل" };
    }

    // SECURITY: Hash password before storing — never store plaintext
    const hashedPassword = await bcrypt.hash(user.password, 12);

    const newUser = {
      name: user.name,
      phone: user.phone,
      email: user.email || "",
      whatsapp: user.whatsapp || "",
      nationalId: user.nationalId || "",
      parentPhone: user.parentPhone || "",
      parentWhatsapp: user.parentWhatsapp || "",
      categoryId: user.categoryId || null,
      classId: user.classId || null,
      discountCode: user.discountCode || "",
      schoolName: user.schoolName || "",
      religion: user.religion || "",
      gender: user.gender || "",
      birthDate: user.birthDate || "",
      notes: user.notes || "",
      fatherJob: user.fatherJob || "",
      fatherPhone: user.fatherPhone || "",
      maxDevices: parseInt(user.maxDevices) || 1,
      password: hashedPassword, // SECURITY: store bcrypt hash
      role: "student",
      status: "نشط",
    };

    // Select without password — never return password to client
    const { data: insertedUser, error } = await supabase
      .from("users")
      .insert(toSnake(newUser))
      .select("id, name, phone, email, role, status, class_id, category_id, parent_phone, whatsapp, parent_whatsapp, school_name, religion, gender, birth_date, notes, father_job, father_phone, discount_code, national_id, max_devices, created_at")
      .single();
    
    if (error) {
       console.error(error);
       return { success: false, message: "حدث خطأ في إنشاء الحساب" };
    }

    const camelUser = toCamel(insertedUser);
    setData((prev) => ({
      ...prev,
      users: [...prev.users, camelUser],
    }));
    return { success: true, user: camelUser };
  };

  const registerUser = async (user) => {
    const phoneRegex = /^01[0-9]{9}$/;
    if (!user.phone || !phoneRegex.test(user.phone)) {
      return { success: false, message: "رقم الهاتف إجباري ويجب أن يتكون من 11 رقماً ويبدأ بـ 01" };
    }
    if (!user.whatsapp || !phoneRegex.test(user.whatsapp)) {
      return { success: false, message: "رقم الواتساب إجباري ويجب أن يتكون من 11 رقماً ويبدأ بـ 01" };
    }
    const nationalIdRegex = /^[0-9]{14}$/;
    if (!user.nationalId || !nationalIdRegex.test(user.nationalId)) {
      return { success: false, message: "الرقم القومي إجباري ويجب أن يتكون من 14 رقماً (أرقام فقط)" };
    }

    const res = await adminAddUser(user);
    if (res.success) {
      setData((prev) => ({ ...prev, currentUser: res.user }));
    }
    return res;
  };

  // SECURITY: Login is now server-side via API route — password never compared client-side
  const loginUser = async (phone, password) => {
    try {
      const { data: result, isHtml } = await safeJsonFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      if (isHtml || !result) {
        return { success: false, message: "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً" };
      }
      if (result.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("fahemCurrentUser", JSON.stringify(result.user));
          if (result.sessionToken) {
            localStorage.setItem("fahemSessionToken", result.sessionToken);
          }
        }
        setData((prev) => ({ ...prev, currentUser: result.user }));
        return { success: true, user: result.user };
      }
      return { success: false, message: result.message };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "خطأ في الاتصال بالخادم" };
    }
  };

  const logoutUser = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("fahemSessionToken") : null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("fahemCurrentUser");
      localStorage.removeItem("fahemSessionToken");
    }
    setData((prev) => ({ ...prev, currentUser: null }));
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: token }),
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const revokeUserSessions = async (userId) => {
    try {
      const { data: json } = await safeJsonFetch("/api/auth/revoke-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!json) {
        return { success: false, message: "تعذر الاتصال بالخادم" };
      }
      return json;
    } catch (err) {
      console.error("revokeUserSessions error:", err);
      return { success: false, message: "خطأ في الاتصال بالخادم" };
    }
  };

  // --- Teacher Actions ---
  const addTeacher = (teacher) => withLoading(async () => {
    const newTeacher = { ...teacher, students: 0, status: "نشط" };
    const { data: inserted, error } = await supabase.from("teachers").insert(toSnake(newTeacher)).select().single();
    if (!error && inserted) setData((prev) => ({ ...prev, teachers: [...prev.teachers, toCamel(inserted)] }));
  });

  const updateTeacher = (id, updatedFields) => withLoading(async () => {
    const { error } = await supabase.from("teachers").update(toSnake(updatedFields)).eq("id", id);
    if (!error) setData((prev) => ({ ...prev, teachers: prev.teachers.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)) }));
  });

  const deleteTeacher = (id) => withLoading(async () => {
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (!error) setData((prev) => ({ ...prev, teachers: prev.teachers.filter((t) => t.id !== id) }));
  });

  // --- Category ---
  const addCategory = (cat) => withLoading(async () => {
    const { data: inserted, error } = await supabase.from("categories").insert(toSnake(cat)).select().single();
    if (!error && inserted) setData((p) => ({ ...p, categories: [...p.categories, toCamel(inserted)] }));
  });
  const updateCategory = (id, fields) => withLoading(async () => {
    const { error } = await supabase.from("categories").update(toSnake(fields)).eq("id", id);
    if (!error) setData((p) => ({ ...p, categories: p.categories.map((c) => (c.id === id ? { ...c, ...fields } : c)) }));
  });
  const deleteCategory = (id) => withLoading(async () => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, categories: p.categories.filter((c) => c.id !== id) }));
  });

  // --- Class ---
  const addClass = (cls) => withLoading(async () => {
    const { data: inserted, error } = await supabase.from("classes").insert(toSnake(cls)).select().single();
    if (!error && inserted) setData((p) => ({ ...p, classes: [...p.classes, toCamel(inserted)] }));
  });
  const updateClass = (id, fields) => withLoading(async () => {
    const { error } = await supabase.from("classes").update(toSnake(fields)).eq("id", id);
    if (!error) setData((p) => ({ ...p, classes: p.classes.map((c) => (c.id === id ? { ...c, ...fields } : c)) }));
  });
  const deleteClass = (id) => withLoading(async () => {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, classes: p.classes.filter((c) => c.id !== id) }));
  });

  // --- Course ---
  const addCourse = (crs) => withLoading(async () => {
    let finalClassId = crs.classId;
    const primaryCategoryId = crs.categoryId || (Array.isArray(crs.categoryIds) && crs.categoryIds[0]) || null;
    if (!finalClassId && primaryCategoryId) {
      let existingClass = data.classes.find(c => c.categoryId === primaryCategoryId);
      if (!existingClass) {
        const cat = data.categories.find(c => c.id === primaryCategoryId);
        const { data: insertedClass } = await supabase.from("classes").insert({
          name: cat ? cat.name : "الصف الافتراضي",
          category_id: primaryCategoryId,
          active: true
        }).select().single();
        if (insertedClass) {
          existingClass = toCamel(insertedClass);
          setData(p => ({ ...p, classes: [...p.classes, existingClass] }));
        }
      }
      finalClassId = existingClass?.id;
    }
    const coursePayload = { ...crs };
    if (finalClassId) coursePayload.classId = finalClassId;
    const snakePayload = toSnake(coursePayload);
    delete snakePayload.category_id;
    if (crs.categoryIds && Array.isArray(crs.categoryIds)) {
      snakePayload.category_ids = crs.categoryIds;
    }

    let inserted = null;
    let error = null;
    const res = await supabase.from("courses").insert(snakePayload).select().single();
    if (res.error && res.error.message && res.error.message.includes("category_ids")) {
      delete snakePayload.category_ids;
      const fallbackRes = await supabase.from("courses").insert(snakePayload).select().single();
      inserted = fallbackRes.data;
      error = fallbackRes.error;
    } else {
      inserted = res.data;
      error = res.error;
    }

    if (!error && inserted) {
      const camel = toCamel(inserted);
      camel.categoryId = primaryCategoryId;
      camel.categoryIds = crs.categoryIds || (primaryCategoryId ? [primaryCategoryId] : []);
      setData((p) => ({ ...p, courses: [...p.courses, camel] }));
    }
  });

  const updateCourse = (id, fields) => withLoading(async () => {
    let finalClassId = fields.classId;
    const primaryCategoryId = fields.categoryId || (Array.isArray(fields.categoryIds) && fields.categoryIds[0]) || null;
    if (!finalClassId && primaryCategoryId) {
      let existingClass = data.classes.find(c => c.categoryId === primaryCategoryId);
      if (!existingClass) {
        const cat = data.categories.find(c => c.id === primaryCategoryId);
        const { data: insertedClass } = await supabase.from("classes").insert({
          name: cat ? cat.name : "الصف الافتراضي",
          category_id: primaryCategoryId,
          active: true
        }).select().single();
        if (insertedClass) {
          existingClass = toCamel(insertedClass);
          setData(p => ({ ...p, classes: [...p.classes, existingClass] }));
        }
      }
      finalClassId = existingClass?.id;
    }
    const updatePayload = { ...fields };
    if (finalClassId) updatePayload.classId = finalClassId;
    const snakePayload = toSnake(updatePayload);
    delete snakePayload.category_id;
    if (fields.categoryIds && Array.isArray(fields.categoryIds)) {
      snakePayload.category_ids = fields.categoryIds;
    }

    let error = null;
    const res = await supabase.from("courses").update(snakePayload).eq("id", id);
    if (res.error && res.error.message && res.error.message.includes("category_ids")) {
      delete snakePayload.category_ids;
      const fallbackRes = await supabase.from("courses").update(snakePayload).eq("id", id);
      error = fallbackRes.error;
    } else {
      error = res.error;
    }

    if (!error) {
      setData((p) => ({
        ...p,
        courses: p.courses.map((c) =>
          c.id === id
            ? {
                ...c,
                ...fields,
                classId: finalClassId || c.classId,
                categoryId: primaryCategoryId || c.categoryId,
                categoryIds: fields.categoryIds || c.categoryIds || (primaryCategoryId ? [primaryCategoryId] : []),
              }
            : c
        ),
      }));
    }
  });

  const cloneCourse = (sourceCourseId, targetCategoryId, newName) => withLoading(async () => {
    const sourceCourse = data.courses.find(c => c.id === sourceCourseId);
    if (!sourceCourse) return null;

    let existingClass = data.classes.find(c => c.categoryId === targetCategoryId);
    if (!existingClass) {
      const cat = data.categories.find(c => c.id === targetCategoryId);
      const { data: insertedClass } = await supabase.from("classes").insert({
        name: cat ? cat.name : "الصف الافتراضي",
        category_id: targetCategoryId,
        active: true
      }).select().single();
      if (insertedClass) {
        existingClass = toCamel(insertedClass);
        setData(p => ({ ...p, classes: [...p.classes, existingClass] }));
      }
    }
    const finalClassId = existingClass?.id;

    const clonedCoursePayload = {
      name: newName || `${sourceCourse.name} (مستدعى)`,
      class_id: finalClassId,
      teacher_id: sourceCourse.teacherId || null,
      image: sourceCourse.image || "",
      active: true,
    };

    const { data: insertedCourse, error: courseErr } = await supabase
      .from("courses")
      .insert(clonedCoursePayload)
      .select()
      .single();

    if (courseErr || !insertedCourse) {
      console.error("Error cloning course:", courseErr);
      return null;
    }

    const newCourse = toCamel(insertedCourse);
    newCourse.categoryId = targetCategoryId;
    newCourse.categoryIds = [targetCategoryId];

    // Find and clone all chapters of source course
    const sourceChapters = data.chapters.filter(ch => ch.courseId === sourceCourseId);
    const newChapters = [];
    const newLessons = [];

    for (const ch of sourceChapters) {
      const chPayload = {
        name: ch.name,
        course_id: newCourse.id,
        lessons_count: ch.lessonsCount || 0,
        image: ch.image || "",
        active: ch.active ?? true,
        price: ch.price || 0,
      };
      const { data: insertedCh } = await supabase
        .from("chapters")
        .insert(chPayload)
        .select()
        .single();

      if (insertedCh) {
        const camelCh = toCamel(insertedCh);
        newChapters.push(camelCh);

        // Find and clone all lessons of this chapter
        const chLessons = data.lessons.filter(l => l.chapterId === ch.id);
        for (const l of chLessons) {
          const lPayload = {
            name: l.name,
            chapter_id: camelCh.id,
            video_url: l.videoUrl || "",
            duration: l.duration || "",
            sort_order: l.sortOrder || 0,
            views: 0,
            max_views: l.maxViews || 5,
            active: l.active ?? true,
            pdf_url: l.pdfUrl || "",
            description: l.description || "",
          };
          const { data: insertedLesson } = await supabase
            .from("lessons")
            .insert(lPayload)
            .select()
            .single();

          if (insertedLesson) {
            newLessons.push(toCamel(insertedLesson));
          }
        }
      }
    }

    setData(p => ({
      ...p,
      courses: [...p.courses, newCourse],
      chapters: [...p.chapters, ...newChapters],
      lessons: [...p.lessons, ...newLessons],
    }));

    return newCourse;
  });

  const deleteCourse = (id) => withLoading(async () => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, courses: p.courses.filter((c) => c.id !== id) }));
  });

  // --- Chapter ---
  const addChapter = (chp) => withLoading(async () => {
    const { data: inserted, error } = await supabase.from("chapters").insert(toSnake(chp)).select().single();
    if (!error && inserted) setData((p) => ({ ...p, chapters: [...p.chapters, toCamel(inserted)] }));
  });
  const updateChapter = (id, fields) => withLoading(async () => {
    const { error } = await supabase.from("chapters").update(toSnake(fields)).eq("id", id);
    if (!error) setData((p) => ({ ...p, chapters: p.chapters.map((c) => (c.id === id ? { ...c, ...fields } : c)) }));
  });
  const deleteChapter = (id) => withLoading(async () => {
    const { error } = await supabase.from("chapters").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, chapters: p.chapters.filter((c) => c.id !== id) }));
  });

  // --- Lesson ---
  const addLesson = (lesson) => withLoading(async () => {
    // Sanitize payload to match lessons table columns in Supabase
    const payload = { ...lesson };
    if (payload.id) delete payload.id;
    if (payload.courseId) delete payload.courseId;
    if (payload.active !== undefined && !payload.status) {
      payload.status = payload.active ? "نشط" : "غير نشط";
    }
    delete payload.active;

    const newLesson = {
      views: 0,
      maxViews: payload.maxViews || 5,
      ...payload,
    };

    const snakePayload = toSnake(newLesson);
    // Remove any fields not existing in Supabase lessons schema to prevent postgrest errors
    delete snakePayload.duration;
    delete snakePayload.description;

    const { data: inserted, error } = await supabase
      .from("lessons")
      .insert(snakePayload)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert lesson error:", error);
      alert("حدث خطأ أثناء إضافة الدرس: " + (error.message || "يرجى مراجعة البيانات"));
      return null;
    }

    if (inserted) {
      const camel = toCamel(inserted);
      setData((prev) => ({ ...prev, lessons: [...prev.lessons, camel] }));
      return camel;
    }
  });

  const updateLesson = (id, fields) => withLoading(async () => {
    const payload = { ...fields };
    if (payload.active !== undefined && !payload.status) {
      payload.status = payload.active ? "نشط" : "غير نشط";
    }
    delete payload.active;
    delete payload.courseId;

    const snakePayload = toSnake(payload);
    delete snakePayload.duration;
    delete snakePayload.description;

    const { data: updated, error } = await supabase
      .from("lessons")
      .update(snakePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update lesson error:", error);
      alert("حدث خطأ أثناء تعديل الدرس: " + (error.message || "يرجى المحاولة مجدداً"));
      return null;
    }

    setData((p) => ({
      ...p,
      lessons: p.lessons.map((l) => (l.id === id ? { ...l, ...fields } : l)),
    }));
    return updated ? toCamel(updated) : null;
  });

  const deleteLesson = (id) => withLoading(async () => {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, lessons: p.lessons.filter((l) => l.id !== id) }));
  });

  // --- Code Actions ---
  // SECURITY: Use crypto.getRandomValues instead of Math.random (not cryptographically secure)
  const _generateSecureCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => chars[b % chars.length]).join("");
  };

  const generateCodes = (count, details) => withLoading(async () => {
    const newCodes = [];
    const existingCodeStrings = new Set(data.codes.map((c) => c.code));
    for (let i = 0; i < count; i++) {
        let codeString;
        // Ensure uniqueness
        do { codeString = _generateSecureCode(); } while (existingCodeStrings.has(codeString));
        existingCodeStrings.add(codeString);
        newCodes.push({
            code: codeString,
            classId: details.classId || null,
            categoryId: details.categoryId || null,
            courseId: details.courseId || null,
            chapterId: details.chapterId || null,
            maxUses: details.maxUses || 1,
            usedCount: 0,
            active: true,
        });
    }

    let inserted = null;
    let error = null;
    const res = await supabase.from("codes").insert(newCodes.map(toSnake)).select();
    if (res.error && res.error.message && res.error.message.includes("course_id")) {
      // In case course_id column is not yet present in Supabase, omit it for insertion
      const fallbackPayload = newCodes.map((c) => {
        const sn = toSnake(c);
        delete sn.course_id;
        return sn;
      });
      const fallbackRes = await supabase.from("codes").insert(fallbackPayload).select();
      inserted = fallbackRes.data;
      error = fallbackRes.error;
    } else {
      inserted = res.data;
      error = res.error;
    }

    if (!error && inserted) {
      setData((prev) => ({
        ...prev,
        codes: [
          ...prev.codes,
          ...inserted.map((c) => ({
            ...toCamel(c),
            courseId: toCamel(c).courseId || details.courseId || null,
          })),
        ],
      }));
    }
  });

  const deleteCode = (id) => withLoading(async () => {
    const { error } = await supabase.from("codes").delete().eq("id", id);
    if (!error) setData((prev) => ({ ...prev, codes: prev.codes.filter((c) => c.id !== id) }));
  });

  const deleteCodes = (ids) => withLoading(async () => {
    const { error } = await supabase.from("codes").delete().in("id", ids);
    if (!error) setData((prev) => ({ ...prev, codes: prev.codes.filter((c) => !ids.includes(c.id)) }));
  });

  // --- Code Verification & Activation ---
  const verifyAndUseCode = async (codeString, userId, contextCategoryId = null, fallbackCourseId = null) => {
    try {
      const cleanCode = (codeString || "").trim();
      if (!cleanCode) {
        return { success: false, message: "يرجى إدخال الكود" };
      }
      if (!userId) {
        return { success: false, message: "يجب تسجيل الدخول أولاً لتفعيل الكود" };
      }

      // Query Supabase directly for real-time accurate verification
      let { data: codeRecord, error: codeErr } = await supabase
        .from("codes")
        .select("*")
        .eq("code", cleanCode)
        .eq("active", true)
        .maybeSingle();

      // If not found with exact match, try case-insensitive
      if (!codeRecord && !codeErr) {
        const { data: ciRecord } = await supabase
          .from("codes")
          .select("*")
          .ilike("code", cleanCode)
          .eq("active", true)
          .maybeSingle();
        if (ciRecord) codeRecord = ciRecord;
      }

      // Also check local store if not found or if courseId was mapped locally
      if (!codeRecord) {
        const localCode = (data.codes || []).find(
          (c) => c.code?.trim().toUpperCase() === cleanCode.toUpperCase() && c.active
        );
        if (localCode) {
          codeRecord = toSnake(localCode);
        }
      }

      if (!codeRecord) {
        return { success: false, message: "الكود غير صحيح أو غير مفعل" };
      }

      if (codeRecord.used_count >= codeRecord.max_uses) {
        return { success: false, message: "هذا الكود استنفد عدد مرات الاستخدام المسموحة" };
      }

      // Increment used count for the code
      const newUsedCount = (codeRecord.used_count || 0) + 1;
      const { error: updateCodeErr } = await supabase
        .from("codes")
        .update({ used_count: newUsedCount })
        .eq("id", codeRecord.id);

      if (updateCodeErr) {
        console.error("Error updating code count:", updateCodeErr);
      }

      // --- CASE 1: COURSE-LEVEL CODE ---
      const courseId = codeRecord.course_id || (codeRecord.chapter_id ? null : (codeRecord.courseId || fallbackCourseId));
      if (courseId) {
        // Target Category context:
        // Wherever student entered the code:
        // - inside course/category: contextCategoryId
        // - standalone: null
        const targetCatId =
          contextCategoryId !== null && contextCategoryId !== undefined && contextCategoryId !== ""
            ? parseInt(contextCategoryId)
            : null;

        // --- Context Validation ---
        // A code tied to a specific category must only be used WITHIN that category.
        // A standalone code (no category_id on the code) must only be used as standalone (no contextCategoryId).
        const codeCategoryId = codeRecord.category_id ? parseInt(codeRecord.category_id) : null;
        if (codeCategoryId !== null && targetCatId === null) {
          // Code belongs to a category, but student tried to use it as standalone
          return {
            success: false,
            message: "هذا الكود مخصص لمادة داخل كورس معين، يرجى فتح المادة من داخل الكورس وإدخال الكود هناك.",
          };
        }
        if (codeCategoryId === null && targetCatId !== null) {
          // Code is standalone, but student tried to use it inside a category/course
          return {
            success: false,
            message: "هذا الكود مخصص لمادة منفصلة، يرجى فتح المادة المنفصلة من القائمة الرئيسية وإدخال الكود هناك.",
          };
        }

        // Reset view counts for all lessons in this course
        const courseChapters = (data.chapters || []).filter(
          (ch) => parseInt(ch.courseId) === parseInt(courseId)
        );

        for (const ch of courseChapters) {
          const { data: chLessons } = await supabase
            .from("lessons")
            .select("id")
            .eq("chapter_id", ch.id);

          if (chLessons && chLessons.length > 0) {
            for (const l of chLessons) {
              await supabase
                .from("view_counts")
                .update({ count: 0 })
                .eq("user_id", userId)
                .eq("lesson_id", l.id);
            }
          }
        }

        // Record in unlocked_courses table specifically for this context
        try {
          const insertPayload = { user_id: userId, course_id: parseInt(courseId) };
          if (targetCatId) {
            insertPayload.category_id = targetCatId;
          } else {
            insertPayload.category_id = null;
          }

          const { error: insErr } = await supabase.from("unlocked_courses").insert(insertPayload);
          if (insErr && insErr.message && insErr.message.includes("category_id")) {
            delete insertPayload.category_id;
            await supabase.from("unlocked_courses").insert(insertPayload);
          }
        } catch (e) {
          console.warn("Could not insert to unlocked_courses:", e);
        }

        // Immediately update local store state so UI updates without waiting
        const newUnlockedItem = {
          id: Date.now().toString(),
          userId: userId,
          user_id: userId,
          courseId: parseInt(courseId),
          course_id: parseInt(courseId),
          categoryId: targetCatId,
          category_id: targetCatId,
          unlockedAt: new Date().toISOString(),
        };

        setData((prev) => ({
          ...prev,
          unlockedCourses: [
            ...(prev.unlockedCourses || []).filter(
              (u) =>
                !(
                  (u.userId === userId || u.user_id === userId) &&
                  parseInt(u.courseId || u.course_id) === parseInt(courseId) &&
                  (targetCatId
                    ? parseInt(u.categoryId || u.category_id) === targetCatId
                    : !u.categoryId && !u.category_id)
                )
            ),
            newUnlockedItem,
          ],
        }));

        // Refresh store state from DB
        await fetchData();

        const courseObj = data.courses.find((c) => c.id === parseInt(courseId));
        const courseName = courseObj ? `مادة "${courseObj.name}"` : "المادة";
        const contextText = targetCatId ? "ضمن هذا الكورس" : "كمادة منفصلة / مستقلة";

        return {
          success: true,
          message: `تم تفعيل كود ${courseName} بنجاح (${contextText}) وفتح جميع فصولها ومحتوياتها! 🎉`,
        };
      }

      // --- CASE 2: CHAPTER-LEVEL CODE (Legacy or Specific Chapter) ---
      const targetChapterId = codeRecord.chapter_id;
      if (!targetChapterId) {
        // Fallback: if neither course_id nor chapter_id is present, but class_id or category_id is
        await fetchData();
        return { success: true, message: "تم تفعيل الكود بنجاح!" };
      }

      // Check if user already has this chapter unlocked
      const { data: alreadyUnlocked } = await supabase
        .from("unlocked_chapters")
        .select("id")
        .eq("user_id", userId)
        .eq("chapter_id", targetChapterId)
        .maybeSingle();

      if (alreadyUnlocked) {
        // Reset view counts for all lessons in this chapter
        const { data: chLessons } = await supabase
          .from("lessons")
          .select("id")
          .eq("chapter_id", targetChapterId);

        if (chLessons && chLessons.length > 0) {
          const lessonIds = chLessons.map((l) => l.id);
          for (const lId of lessonIds) {
            await supabase
              .from("view_counts")
              .update({ count: 0 })
              .eq("user_id", userId)
              .eq("lesson_id", lId);
          }
        }
      } else {
        // Unlock chapter for this user
        const { error: unlockErr } = await supabase
          .from("unlocked_chapters")
          .insert({ user_id: userId, chapter_id: targetChapterId });

        if (unlockErr) {
          console.error("Error inserting unlocked_chapter:", unlockErr);
        }
      }

      // Refresh store state to update UI immediately
      await fetchData();

      return {
        success: true,
        message: alreadyUnlocked
          ? "تم تفعيل الكود بنجاح وتجديد عدد المشاهدات!"
          : "تم تفعيل الكود وفتح الباب بنجاح!",
      };
    } catch (err) {
      console.error("Code verification error:", err?.message || err);
      return { success: false, message: "حدث خطأ أثناء التحقق من الكود، يرجى المحاولة مرة أخرى." };
    }
  };

  // --- Lesson Reorder ---
  // Updates sort_order for a list of lessons after drag-and-drop reordering
  const reorderLessons = async (reorderedLessons) => {
    // Optimistically update local state immediately
    setData((prev) => ({
      ...prev,
      lessons: prev.lessons.map((l) => {
        const updated = reorderedLessons.find((r) => r.id === l.id);
        return updated ? { ...l, sortOrder: updated.sortOrder } : l;
      }),
    }));
    // Persist each change to Supabase
    try {
      const updates = reorderedLessons.map((l) =>
        supabase.from("lessons").update({ sort_order: l.sortOrder }).eq("id", l.id)
      );
      await Promise.all(updates);
    } catch (err) {
      console.error("Reorder lessons error:", err);
    }
  };

  const incrementLessonView = async (userId, lessonId) => {
    if (!userId || !lessonId) return;
    
    // optimistically update local state
    setData((prev) => {
        const currentViewCounts = prev.viewCounts || [];
        const existingCountIndex = currentViewCounts.findIndex(v => v.userId === userId && v.lessonId === lessonId);
        let newViewCounts = [...currentViewCounts];
        if (existingCountIndex > -1) {
            newViewCounts[existingCountIndex] = { ...newViewCounts[existingCountIndex], count: newViewCounts[existingCountIndex].count + 1 };
        } else {
            newViewCounts.push({ userId, lessonId, count: 1 });
        }
        return {
            ...prev,
            viewCounts: newViewCounts,
        };
    });

    const existing = data.viewCounts.find(v => v.userId === userId && v.lessonId === lessonId);
    if (existing) {
       await supabase.from("view_counts").update({ count: existing.count + 1 }).eq("id", existing.id);
    } else {
       await supabase.from("view_counts").insert(toSnake({ userId, lessonId, count: 1 }));
       await supabase.from("lesson_views").insert(toSnake({ userId, lessonId }));
    }
  };

  const deleteUser = (id) => withLoading(async () => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error) setData((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }));
  });

  // --- Admin Direct Unlock / Revoke for Specific Student ---
  const adminUnlockCategory = async (userId, categoryId) => {
    return await adminUnlockCategories(userId, [categoryId]);
  };

  const adminUnlockCategories = async (userId, categoryIds = []) => {
    try {
      let totalCourses = 0;
      for (const rawCatId of categoryIds) {
        const catId = parseInt(rawCatId);
        const catCourses = data.courses.filter((c) => {
          if (c.categoryId === catId) return true;
          if (Array.isArray(c.categoryIds) && c.categoryIds.map(Number).includes(catId)) return true;
          const matchClass = data.classes.find((cl) => cl.id === c.classId);
          return matchClass && matchClass.categoryId === catId;
        });

        for (const crs of catCourses) {
          try {
            const payload = { user_id: userId, course_id: crs.id, category_id: catId };
            const { error: insErr } = await supabase.from("unlocked_courses").insert(payload);
            if (insErr && insErr.message && insErr.message.includes("category_id")) {
              delete payload.category_id;
              await supabase.from("unlocked_courses").insert(payload);
            }
            totalCourses++;
          } catch (e) {}
        }
      }

      await fetchData();
      return {
        success: true,
        message: `تم تفعيل ${categoryIds.length} كورس (${totalCourses} مادة) للطالب بنجاح! 🎉`,
      };
    } catch (e) {
      console.error(e);
      return { success: false, message: "حدث خطأ أثناء تفعيل الكورسات للطالب" };
    }
  };

  const adminUnlockCourse = async (userId, courseId, categoryId = null) => {
    return await adminUnlockCourses(userId, [courseId], categoryId);
  };

  const adminUnlockCourses = async (userId, courseIds = [], categoryId = null) => {
    try {
      const catId = categoryId ? parseInt(categoryId) : null;
      let count = 0;
      for (const rawCourseId of courseIds) {
        const cId = parseInt(rawCourseId);
        try {
          const payload = { user_id: userId, course_id: cId };
          if (catId) payload.category_id = catId;
          const { error: insErr } = await supabase.from("unlocked_courses").insert(payload);
          if (insErr && insErr.message && insErr.message.includes("category_id")) {
            delete payload.category_id;
            await supabase.from("unlocked_courses").insert(payload);
          }
          count++;
        } catch (e) {}
      }

      await fetchData();
      const scopeLabel = catId ? "ضمن الكورس المحدد" : "كمواد منفصلة ومستقلة";
      return {
        success: true,
        message: `تم فتح ${count} مادة دراسية للطالب بنجاح (${scopeLabel})! 🎉`,
      };
    } catch (e) {
      console.error(e);
      return { success: false, message: "حدث خطأ أثناء فتح المواد للطالب" };
    }
  };

  const adminUnlockChapter = async (userId, chapterId) => {
    return await adminUnlockChapters(userId, [chapterId]);
  };

  const adminUnlockChapters = async (userId, chapterIds = []) => {
    try {
      let count = 0;
      for (const rawChId of chapterIds) {
        const chId = parseInt(rawChId);
        const { data: already } = await supabase
          .from("unlocked_chapters")
          .select("id")
          .eq("user_id", userId)
          .eq("chapter_id", chId)
          .maybeSingle();
        if (!already) {
          await supabase.from("unlocked_chapters").insert({ user_id: userId, chapter_id: chId });
          count++;
        }
      }
      await fetchData();
      return {
        success: true,
        message: `تم فتح ${chapterIds.length} فصل للطالب بنجاح! 🎉`,
      };
    } catch (e) {
      console.error(e);
      return { success: false, message: "حدث خطأ أثناء فتح الفصول للطالب" };
    }
  };

  const adminRevokeCourse = async (userId, courseId, categoryId = null) => {
    try {
      const cId = parseInt(courseId);
      let query = supabase.from("unlocked_courses").delete().eq("user_id", userId).eq("course_id", cId);
      if (categoryId) {
        query = query.eq("category_id", parseInt(categoryId));
      }
      await query;

      await fetchData();
      return { success: true, message: "تم إلغاء تفعيل المادة للطالب بنجاح" };
    } catch (e) {
      console.error(e);
      return { success: false, message: "حدث خطأ أثناء إلغاء التفعيل" };
    }
  };

  const adminBatchRevokeCourses = async (userId, list = []) => {
    try {
      for (const item of list) {
        let query = supabase
          .from("unlocked_courses")
          .delete()
          .eq("user_id", userId)
          .eq("course_id", parseInt(item.courseId));
        if (item.categoryId) {
          query = query.eq("category_id", parseInt(item.categoryId));
        }
        await query;
      }
      await fetchData();
      return {
        success: true,
        message: `تم إلغاء تفعيل ${list.length} مادة للطالب بنجاح`,
      };
    } catch (e) {
      console.error(e);
      return { success: false, message: "حدث خطأ أثناء إلغاء تفعيل المواد" };
    }
  };

  const adminRevokeChapter = async (userId, chapterId) => {
    try {
      await supabase
        .from("unlocked_chapters")
        .delete()
        .eq("user_id", userId)
        .eq("chapter_id", parseInt(chapterId));
      await fetchData();
      return { success: true, message: "تم قفل الفصل للطالب بنجاح" };
    } catch (e) {
      console.error(e);
      return { success: false, message: "حدث خطأ أثناء قفل الفصل" };
    }
  };

  // --- Notifications ---
  const addNotification = (notif) => withLoading(async () => {
    const { data: inserted, error } = await supabase.from("notifications").insert(toSnake(notif)).select().single();
    if (!error && inserted) setData((p) => ({ ...p, notifications: [toCamel(inserted), ...p.notifications] }));
  });

  const deleteNotification = (id) => withLoading(async () => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, notifications: p.notifications.filter((n) => n.id !== id) }));
  });

  const dismissNotification = (userId, notificationId) => withLoading(async () => {
    const { data: inserted, error } = await supabase.from("dismissed_notifications").insert(toSnake({ userId, notificationId })).select().single();
    if (!error && inserted) {
      setData((p) => ({ ...p, dismissedNotifications: [...p.dismissedNotifications, toCamel(inserted)] }));
    }
  });

  // ── Exam Banks ──────────────────────────────────────────────
  const addExamBank = (bank) => withLoading(async () => {
    const raw = toSnake(bank);
    const payload = {
      name: raw.name,
      subject_name: raw.subject_name,
      course_id: raw.course_id ? parseInt(raw.course_id, 10) : null,
      created_by_admin: raw.created_by_admin ?? true,
    };
    const { data: inserted, error } = await supabase.from("exam_banks").insert(payload).select().single();
    if (error) {
      console.error("Error adding exam bank:", error);
      alert("حدث خطأ أثناء حفظ بنك الامتحان: " + (error.message || "يرجى المحاولة مرة أخرى"));
      return null;
    }
    if (inserted) {
      const camel = toCamel(inserted);
      setData(p => ({ ...p, examBanks: [...p.examBanks, camel] }));
      return camel;
    }
  });

  const updateExamBank = (id, fields) => withLoading(async () => {
    const payload = { ...toSnake(fields) };
    if ("course_id" in payload) {
      payload.course_id = payload.course_id ? parseInt(payload.course_id, 10) : null;
    }
    const { error } = await supabase.from("exam_banks").update(payload).eq("id", id);
    if (error) {
      console.error("Error updating exam bank:", error);
      alert("حدث خطأ أثناء تعديل الامتحان: " + (error.message || ""));
      return;
    }
    setData(p => ({ ...p, examBanks: p.examBanks.map(b => b.id === id ? { ...b, ...fields } : b) }));
  });

  const deleteExamBank = (id) => withLoading(async () => {
    const { error } = await supabase.from("exam_banks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting exam bank:", error);
      alert("حدث خطأ أثناء حذف الامتحان: " + (error.message || ""));
      return;
    }
    setData(p => ({ ...p, examBanks: p.examBanks.filter(b => b.id !== id) }));
  });

  // ── Exam Questions ───────────────────────────────────────────
  const addExamQuestion = (q) => withLoading(async () => {
    const raw = toSnake(q);
    const payload = {
      exam_bank_id: parseInt(raw.exam_bank_id, 10),
      question_text: raw.question_text || "",
      question_image: raw.question_image || "",
      sort_order: parseInt(raw.sort_order, 10) || 0,
    };
    const { data: inserted, error } = await supabase.from("exam_questions").insert(payload).select().single();
    if (error) {
      console.error("Error adding question:", error);
      alert("حدث خطأ أثناء إضافة السؤال: " + (error.message || ""));
      return null;
    }
    if (inserted) {
      const camel = toCamel(inserted);
      setData(p => ({ ...p, examQuestions: [...p.examQuestions, camel] }));
      return camel;
    }
  });

  const updateExamQuestion = (id, fields) => withLoading(async () => {
    const payload = { ...toSnake(fields) };
    if ("exam_bank_id" in payload) payload.exam_bank_id = parseInt(payload.exam_bank_id, 10);
    if ("sort_order" in payload) payload.sort_order = parseInt(payload.sort_order, 10) || 0;
    const { error } = await supabase.from("exam_questions").update(payload).eq("id", id);
    if (error) {
      console.error("Error updating question:", error);
      alert("حدث خطأ أثناء تعديل السؤال: " + (error.message || ""));
      return;
    }
    setData(p => ({ ...p, examQuestions: p.examQuestions.map(q => q.id === id ? { ...q, ...fields } : q) }));
  });

  const deleteExamQuestion = (id) => withLoading(async () => {
    const { error } = await supabase.from("exam_questions").delete().eq("id", id);
    if (error) {
      console.error("Error deleting question:", error);
      alert("حدث خطأ أثناء حذف السؤال: " + (error.message || ""));
      return;
    }
    setData(p => ({ ...p, examQuestions: p.examQuestions.filter(q => q.id !== id) }));
  });

  // ── Exam Choices ─────────────────────────────────────────────
  const addExamChoice = (c) => withLoading(async () => {
    const raw = toSnake(c);
    const payload = {
      question_id: parseInt(raw.question_id, 10),
      choice_text: raw.choice_text || "",
      is_correct: !!raw.is_correct,
      sort_order: parseInt(raw.sort_order, 10) || 0,
    };
    const { data: inserted, error } = await supabase.from("exam_choices").insert(payload).select().single();
    if (error) {
      console.error("Error adding choice:", error);
      alert("حدث خطأ أثناء إضافة الخيار: " + (error.message || ""));
      return null;
    }
    if (inserted) {
      const camel = toCamel(inserted);
      setData(p => ({ ...p, examChoices: [...p.examChoices, camel] }));
      return camel;
    }
  });

  const updateExamChoice = (id, fields) => withLoading(async () => {
    const payload = { ...toSnake(fields) };
    if ("question_id" in payload) payload.question_id = parseInt(payload.question_id, 10);
    if ("sort_order" in payload) payload.sort_order = parseInt(payload.sort_order, 10) || 0;
    const { error } = await supabase.from("exam_choices").update(payload).eq("id", id);
    if (error) {
      console.error("Error updating choice:", error);
      alert("حدث خطأ أثناء تعديل الخيار: " + (error.message || ""));
      return;
    }
    setData(p => ({ ...p, examChoices: p.examChoices.map(c => c.id === id ? { ...c, ...fields } : c) }));
  });

  const deleteExamChoice = (id) => withLoading(async () => {
    const { error } = await supabase.from("exam_choices").delete().eq("id", id);
    if (error) {
      console.error("Error deleting choice:", error);
      alert("حدث خطأ أثناء حذف الخيار: " + (error.message || ""));
      return;
    }
    setData(p => ({ ...p, examChoices: p.examChoices.filter(c => c.id !== id) }));
  });

  // ── Lesson Quizzes (ربط امتحان بدرس) ────────────────────────
  const addLessonQuiz = (lq) => withLoading(async () => {
    const raw = toSnake(lq);
    const payload = {
      lesson_id: parseInt(raw.lesson_id, 10),
      exam_bank_id: parseInt(raw.exam_bank_id, 10),
      pass_percentage: parseInt(raw.pass_percentage, 10) || 50,
      locks_next_lessons: raw.locks_next_lessons !== false,
      retry_hours: parseInt(raw.retry_hours, 10) || 4,
    };
    const { data: inserted, error } = await supabase
      .from("lesson_quizzes")
      .upsert(payload, { onConflict: "lesson_id" })
      .select()
      .single();
    if (error) {
      console.error("Error adding lesson quiz:", error);
      alert("حدث خطأ أثناء ربط الكويز: " + (error.message || ""));
      return null;
    }
    if (inserted) {
      const camel = toCamel(inserted);
      setData(p => ({
        ...p,
        lessonQuizzes: [
          ...p.lessonQuizzes.filter(q => q.lessonId !== camel.lessonId && q.id !== camel.id),
          camel
        ]
      }));
      return camel;
    }
  });

  const updateLessonQuiz = (id, fields) => withLoading(async () => {
    const payload = { ...toSnake(fields) };
    if ("lesson_id" in payload) payload.lesson_id = parseInt(payload.lesson_id, 10);
    if ("exam_bank_id" in payload) payload.exam_bank_id = parseInt(payload.exam_bank_id, 10);
    if ("pass_percentage" in payload) payload.pass_percentage = parseInt(payload.pass_percentage, 10) || 50;
    if ("retry_hours" in payload) payload.retry_hours = parseInt(payload.retry_hours, 10) || 4;
    const { error } = await supabase.from("lesson_quizzes").update(payload).eq("id", id);
    if (error) {
      console.error("Error updating lesson quiz:", error);
      alert("حدث خطأ أثناء تعديل الكويز: " + (error.message || ""));
      return;
    }
    setData(p => ({ ...p, lessonQuizzes: p.lessonQuizzes.map(lq => lq.id === id ? { ...lq, ...fields } : lq) }));
  });
  const deleteLessonQuiz = (id) => withLoading(async () => {
    const { error } = await supabase.from("lesson_quizzes").delete().eq("id", id);
    if (!error) setData(p => ({ ...p, lessonQuizzes: p.lessonQuizzes.filter(lq => lq.id !== id) }));
  });

  // ── Quiz Attempts (محاولات الطلاب) ──────────────────────────
  const submitQuizAttempt = async (attempt) => {
    const { data: inserted, error } = await supabase.from("quiz_attempts").insert(toSnake(attempt)).select().single();
    if (!error && inserted) {
      const camel = toCamel(inserted);
      setData(p => ({ ...p, quizAttempts: [camel, ...p.quizAttempts] }));
      // إشعار إعادة المحاولة بعد 4 ساعات (لو راسب)
      if (!attempt.passed && attempt.canRetryAt) {
        await supabase.from("quiz_retry_notifications").insert({
          user_id: attempt.userId,
          lesson_quiz_id: attempt.lessonQuizId,
          notify_at: attempt.canRetryAt,
          sent: false,
        });
      }
      // إصدار شهادة تلقائية لو نجح (اختياري)
      return camel;
    }
    return null;
  };

  // ── Certificates ─────────────────────────────────────────────
  const issueCertificate = async (userId, chapterId) => {
    // تحقق لو مصدرة مسبقاً
    const existing = data.certificates.find(c => c.userId === userId && c.chapterId === chapterId);
    if (existing) return existing;
    const { data: inserted, error } = await supabase
      .from("certificates")
      .insert({ user_id: userId, chapter_id: chapterId })
      .select().single();
    if (!error && inserted) {
      const camel = toCamel(inserted);
      setData(p => ({ ...p, certificates: [...p.certificates, camel] }));
      return camel;
    }
    return null;
  };

  const getUserCertificates = (userId) => data.certificates.filter(c => c.userId === userId);

  // ── Reset Quiz Attempt (الأدمن أو المدرس يعيد فتح المحاولة لطالب) ──
  const resetQuizAttempt = async (attemptId) => {
    const { error } = await supabase.from("quiz_attempts").delete().eq("id", attemptId);
    if (!error) {
      setData((p) => ({
        ...p,
        quizAttempts: p.quizAttempts.filter((a) => a.id !== attemptId),
      }));
      return { success: true };
    }
    return { success: false, message: error?.message };
  };

  // ── Teacher Authentication & Files ──────────────────────────
  const loginTeacher = async (identifier, password) => {
    const clean = (identifier || "").trim().toLowerCase();
    const teacher = (data.teachers || []).find((t) => {
      const ph = (t.phone || "").trim().toLowerCase();
      const em = (t.email || "").trim().toLowerCase();
      const un = (t.username || "").trim().toLowerCase();
      return ph === clean || em === clean || un === clean;
    });

    if (!teacher) {
      return { success: false, message: "بيانات الدخول غير صحيحة، تأكد من رقم الهاتف أو اسم المستخدم." };
    }

    if (teacher.status && teacher.status !== "نشط") {
      return { success: false, message: "حساب المدرس غير نشط حالياً، يرجى مراجعة إدارة المنصة." };
    }

    // التحقق من كلمة المرور
    if (teacher.password) {
      const match = teacher.password === password;
      if (!match) {
        return { success: false, message: "كلمة المرور غير صحيحة." };
      }
    }

    localStorage.setItem("fahemCurrentTeacher", JSON.stringify(teacher));
    setData((p) => ({ ...p, currentTeacher: teacher }));
    return { success: true, teacher };
  };

  const logoutTeacher = () => {
    localStorage.removeItem("fahemCurrentTeacher");
    setData((p) => ({ ...p, currentTeacher: null }));
  };

  const addTeacherFile = (tf) => withLoading(async () => {
    const payload = toSnake(tf);
    let inserted = null;
    let error = null;

    const res = await supabase.from("teacher_files").insert(payload).select().single();
    if (res.error && res.error.message && res.error.message.includes("lesson_id")) {
      delete payload.lesson_id;
      const fallbackRes = await supabase.from("teacher_files").insert(payload).select().single();
      inserted = fallbackRes.data;
      error = fallbackRes.error;
    } else {
      inserted = res.data;
      error = res.error;
    }

    if (!error && inserted) {
      const camel = toCamel(inserted);
      if (tf.lessonId) camel.lessonId = tf.lessonId;
      setData((p) => ({ ...p, teacherFiles: [camel, ...p.teacherFiles] }));
    }
  });

  const deleteTeacherFile = (id) => withLoading(async () => {
    const { error } = await supabase.from("teacher_files").delete().eq("id", id);
    if (!error) {
      setData((p) => ({ ...p, teacherFiles: p.teacherFiles.filter((f) => f.id !== id) }));
    }
  });

  const updateUser = (id, updates) => withLoading(async () => {
    const { error } = await supabase.from("users").update(toSnake(updates)).eq("id", id);
    if (!error) {
      setData((prev) => {
        const updatedUsers = prev.users.map((u) => (u.id === id ? { ...u, ...updates } : u));
        const updatedCurrentUser = prev.currentUser && prev.currentUser.id === id ? { ...prev.currentUser, ...updates } : prev.currentUser;
        return { ...prev, users: updatedUsers, currentUser: updatedCurrentUser };
      });
    }
  });

  const loginParent = async (parentPhone, studentPhone) => {
    const student = data.users.find(u => u.phone === studentPhone && u.parentPhone === parentPhone);
    if (!student) return { success: false, message: "بيانات الدخول غير صحيحة أو الطالب غير مسجل برقم هاتف ولي الأمر هذا." };
    
    const parentSession = { parentPhone };
    localStorage.setItem("fahemCurrentParent", JSON.stringify(parentSession));
    setData(prev => ({ ...prev, currentParent: parentSession }));
    return { success: true };
  };

  const logoutParent = () => {
    localStorage.removeItem("fahemCurrentParent");
    setData(prev => ({ ...prev, currentParent: null }));
  };

  return (
    <GlobalContext.Provider
      value={{
        ...data,
        isLoaded,
        isSubmitting,
        registerUser,
        loginUser,
        logoutUser,
        revokeUserSessions,
        adminAddUser,
        loginParent,
        logoutParent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addCategory,
        updateCategory,
        deleteCategory,
        addClass,
        updateClass,
        deleteClass,
        addCourse,
        updateCourse,
        deleteCourse,
        cloneCourse,
        addChapter,
        updateChapter,
        deleteChapter,
        addLesson,
        updateLesson,
        deleteLesson,
        reorderLessons,
        generateCodes,
        // Quiz system
        addExamBank,
        updateExamBank,
        deleteExamBank,
        addExamQuestion,
        updateExamQuestion,
        deleteExamQuestion,
        addExamChoice,
        updateExamChoice,
        deleteExamChoice,
        addLessonQuiz,
        updateLessonQuiz,
        deleteLessonQuiz,
        submitQuizAttempt,
        issueCertificate,
        getUserCertificates,
        resetQuizAttempt,
        // Teacher auth & files
        loginTeacher,
        logoutTeacher,
        addTeacherFile,
        deleteTeacherFile,
        deleteCode,
        deleteCodes,
        verifyAndUseCode,
        incrementLessonView,
        deleteUser,
        updateUser,
        addNotification,
        deleteNotification,
        dismissNotification,
        // Admin Student Unlocks
        adminUnlockCategory,
        adminUnlockCategories,
        adminUnlockCourse,
        adminUnlockCourses,
        adminUnlockChapter,
        adminUnlockChapters,
        adminRevokeCourse,
        adminRevokeChapter,
        adminBatchRevokeCourses,
      }}
    >
      {isSubmitting && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", direction: "rtl" }}>
          <div style={{ backgroundColor: "#ffffff", padding: "20px 40px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <div style={{ width: "30px", height: "30px", border: "4px solid #f3f3f3", borderTop: "4px solid #ef4444", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>جاري تحديث البيانات...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalStore = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobalStore must be used within a GlobalProvider");
  return context;
};
