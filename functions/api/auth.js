/**
 * ====================================================
 *  VIRU AI - Server-Side Owner Authentication
 *  Created by: Viruna Randinu
 * ====================================================
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const securityHeaders = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };

  try {
    const { username, password } = await request.json();

    // Owner Login Credentials
    const OWNER_USER = env.OWNER_USERNAME || "viruna";
    const OWNER_PASS = env.OWNER_PASSWORD || "2010";

    if (username === OWNER_USER && password === OWNER_PASS) {
      // Secure Signature Token
      const token = btoa(`${username}:${Date.now()}:${OWNER_PASS.slice(0, 2)}`);

      return new Response(JSON.stringify({
        success: true,
        displayName: "Viruna",
        token: token
      }), {
        headers: securityHeaders,
        status: 200
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid Credentials"
      }), {
        headers: securityHeaders,
        status: 401
      });
    }

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "Auth Server Error" }), {
      headers: securityHeaders,
      status: 500
    });
  }
}
