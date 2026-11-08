export default async (request, context) => {
  const url = new URL(request.url);
  const targetUrl = "https://openrouter.ai" + url.pathname + url.search;

  const cleanHeaders = new Headers();
  if (request.headers.get("authorization")) {
    cleanHeaders.set("Authorization", request.headers.get("authorization"));
  }
  if (request.headers.get("content-type")) {
    cleanHeaders.set("Content-Type", request.headers.get("content-type"));
  }
  cleanHeaders.set("HTTP-Referer", "https://chatboxai.app");
  cleanHeaders.set("X-Title", "Chatbox");

  const res = await fetch(targetUrl, {
    method: request.method,
    headers: cleanHeaders,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    redirect: "manual",
  });

  const resHeaders = new Headers();
  resHeaders.set("Content-Type", res.headers.get("content-type") || "application/json");
  resHeaders.set("Access-Control-Allow-Origin", "*");
  resHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  resHeaders.set("Access-Control-Allow-Headers", "*");

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: resHeaders });
  }

  return new Response(res.body, {
    status: res.status,
    headers: resHeaders,
  });
};

export const config = { path: "/*" };
