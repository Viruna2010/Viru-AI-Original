/**
 * ====================================================
 *  VIRU AI - Server-Side Video Pipeline (Zero CORS)
 *  Creator: Viruna Randinu | Brand: VIRU AI
 * ====================================================
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const prompt = url.searchParams.get("prompt");

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "X-Created-By": "Viruna Randinu",
    "X-Owner": "VIRU AI"
  };

  if (!prompt || prompt.trim() === "") {
    return new Response(JSON.stringify({ status: false, error: "Prompt is required" }), { headers, status: 400 });
  }

  const API_KEY = env.ANABOT_API_KEY || "freeApikey";

  try {
    // Cloudflare Server එකෙන්ම කෙලින්ම Video එක ලබා ගැනීම
    const targetUrl = `https://anabot.my.id/api/ai/text2video?prompt=${encodeURIComponent(prompt.trim())}&apikey=${encodeURIComponent(API_KEY)}`;
    const response = await fetch(targetUrl);
    const data = await response.json();

    if (data && data.success && data.data && data.data.result) {
      return new Response(JSON.stringify({
        creator: "Viruna Randinu",
        owner: "VIRU AI",
        status: true,
        service: "VIRU-AI Video Generator",
        aspect_ratio: "9:16",
        prompt: prompt.trim(),
        video_url: data.data.result,
        download_url: data.data.result
      }), { headers, status: 200 });
    } else {
      return new Response(JSON.stringify({
        creator: "Viruna Randinu",
        owner: "VIRU AI",
        status: false,
        error: "Upstream engine returned error",
        raw: data
      }), { headers, status: 502 });
    }

  } catch (error) {
    return new Response(JSON.stringify({
      creator: "Viruna Randinu",
      owner: "VIRU AI",
      status: false,
      error: "Server-side video fetch error",
      details: error.message
    }), { headers, status: 500 });
  }
}
