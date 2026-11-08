export default async (request, context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

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

  // 先把请求体完整读出来，彻底防止 Edge Function 转发 ReadableStream 时崩溃报错！
  let bodyData = undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    bodyData = await request.text();
  }

  const res = await fetch(targetUrl, {
    method: request.method,
    headers: cleanHeaders,
    body: bodyData,
  });

  const resHeaders = new Headers();
  resHeaders.set("Content-Type", res.headers.get("content-type") || "application/json");
  resHeaders.set("Access-Control-Allow-Origin", "*");

  return new Response(res.body, {
    status: res.status,
    headers: resHeaders,
  });
};

export const config = { path: "/*" };
