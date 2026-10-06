/**
 * تحليل نوع ونظام الجهاز من الـ User-Agent
 */
export function parseDeviceInfo(userAgent) {
  if (!userAgent) return "جهاز غير معروف";
  
  let os = "كمبيوتر";
  if (/windows phone/i.test(userAgent)) os = "Windows Phone";
  else if (/win/i.test(userAgent)) os = "كمبيوتر (Windows)";
  else if (/android/i.test(userAgent)) os = "موبايل (Android)";
  else if (/ipad/i.test(userAgent)) os = "تابلت (iPad)";
  else if (/iphone/i.test(userAgent)) os = "موبايل (iPhone)";
  else if (/mac/i.test(userAgent)) os = "كمبيوتر (Mac)";
  else if (/linux/i.test(userAgent)) os = "Linux";

  let browser = "متصفح";
  if (/edg/i.test(userAgent)) browser = "Edge";
  else if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) browser = "Opera";
  else if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) browser = "Chrome";
  else if (/firefox/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Safari";

  return `${os} - ${browser}`;
}
