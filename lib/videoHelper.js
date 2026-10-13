/**
 * Helper to parse, sanitize and identify video sources (YouTube, Bunny.net Stream, Generic)
 */

export const cleanVideoInput = (rawInput) => {
  if (!rawInput || typeof rawInput !== "string") return "";
  const trimmed = rawInput.trim();

  // If user pasted an iframe tag, extract the src attribute
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1].trim();
  }

  return trimmed;
};

export const parseVideoSource = (rawUrl) => {
  const url = cleanVideoInput(rawUrl);
  if (!url) {
    return { type: "none", url: "", videoId: null, embedUrl: "" };
  }

  // 1. Check for YouTube
  const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  if (ytMatch && ytMatch[2] && ytMatch[2].length === 11) {
    const videoId = ytMatch[2];
    return {
      type: "youtube",
      videoId,
      url,
      embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`,
    };
  }

  // 2. Check for Bunny Stream
  // Common Bunny Stream domains: iframe.mediadelivery.net, video.bunnycdn.com, *.b-cdn.net
  const isBunny = 
    url.includes("mediadelivery.net") || 
    url.includes("bunnycdn.com") || 
    url.includes("b-cdn.net");

  if (isBunny) {
    let embedUrl = url;
    // If it's a play link (/play/), convert to embed (/embed/)
    if (embedUrl.includes("/play/")) {
      embedUrl = embedUrl.replace("/play/", "/embed/");
    }

    // Extract libraryId and videoId if possible (e.g. embed/LIBRARY_ID/VIDEO_ID)
    const bunnyMatch = embedUrl.match(/embed\/([^\/\?]+)\/([^\/\?]+)/);
    const libraryId = bunnyMatch ? bunnyMatch[1] : null;
    const videoId = bunnyMatch ? bunnyMatch[2] : null;

    // Ensure parameters for optimal embedding if not present
    let finalEmbedUrl = embedUrl;
    if (!finalEmbedUrl.includes("?")) {
      finalEmbedUrl += "?autoplay=false&preload=true&responsive=true";
    }

    return {
      type: "bunny",
      url,
      embedUrl: finalEmbedUrl,
      libraryId,
      videoId,
    };
  }

  // 3. Fallback generic video / iframe
  return {
    type: "generic",
    url,
    embedUrl: url,
    videoId: null,
  };
};
