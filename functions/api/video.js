/**
 * ====================================================
 *  VIRU AI - Video Generator Cloudflare Backend Router
 *  Main Engine: Vercel API (video-genarator-api.vercel.app)
 *  Fallback Engine: Upstream Backup
 *  Creator: Viruna Randinu | Brand: VIRU AI
 * ====================================================
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const prompt = url.searchParams.get("prompt");

  const securityHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "X-Created-By": "Viruna Randinu",
    "X-Owner": "VIRU AI"
  };

  if (!prompt || prompt.trim() === "") {
    return new Response(JSON.stringify({ status: false, error: "Prompt is required" }), {
      headers: securityHeaders,
      status: 400
    });
  }

  // ==========================================
  // 1. MAIN API: VERCEL SERVERLESS ENDPOINT
  // ==========================================
  try {
    const vercelUrl = `https://video-genarator-api.vercel.app/api/generate?prompt=${encodeURIComponent(prompt.trim())}`;
    const vercelRes = await fetch(vercelUrl);
    const vercelData = await vercelRes.json();

    if (vercelData && vercelData.status && vercelData.video_url) {
      return new Response(JSON.stringify(vercelData), {
        headers: securityHeaders,
        status: 200
      });
    }
  } catch (vercelError) {
    console.error("Vercel Main API error, switching to Fallback:", vercelError);
  }

  // ==========================================
  // 2. FALLBACK API: UPSTREAM ENGINE
  // ==========================================
  try {
    const finalPrompt = `${prompt.trim()}, 9:16 vertical aspect ratio, portrait video, tiktok reels format, high quality`;
    const API_KEY = env.ANABOT_API_KEY || "freeApikey";
    const fallbackUrl = `https://anabot.my.id/api/ai/text2video?prompt=${encodeURIComponent(finalPrompt)}&apikey=${encodeURIComponent(API_KEY)}`;
    
    const fallbackRes = await fetch(fallbackUrl);
    const fallbackData = await fallbackRes.json();

    if (fallbackData.success && fallbackData.data && fallbackData.data.result) {
      const sourceVideoUrl = fallbackData.data.result;
      return new Response(JSON.stringify({
        creator: "Viruna Randinu",
        owner: "VIRU AI",
        status: true,
        service: "VIRU-AI Video Generator",
        aspect_ratio: "9:16",
        prompt: prompt.trim(),
        video_url: sourceVideoUrl,
        download_url: sourceVideoUrl
      }), {
        headers: securityHeaders,
        status: 200
      });
    }
  } catch (fallbackError) {
    console.error("Fallback API error:", fallbackError);
  }

  return new Response(JSON.stringify({
    creator: "Viruna Randinu",
    owner: "VIRU AI",
    status: false,
    error: "Video generation failed on all pipelines. Please try again."
  }), {
    headers: securityHeaders,
    status: 502
  });
}
