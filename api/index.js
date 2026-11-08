export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

export default async function handler(req) {
  const url = new URL(req.url);
  const targetUrl = 'https://openrouter.ai' + url.pathname + url.search;

  const cleanHeaders = new Headers();
  if (req.headers.get('authorization')) {
    cleanHeaders.set('Authorization', req.headers.get('authorization'));
  }
  if (req.headers.get('content-type')) {
    cleanHeaders.set('Content-Type', req.headers.get('content-type'));
  }
  cleanHeaders.set('HTTP-Referer', 'https://chatboxai.app');
  cleanHeaders.set('X-Title', 'Chatbox');

  const res = await fetch(targetUrl, {
    method: req.method,
    headers: cleanHeaders,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    redirect: 'manual',
  });

  const resHeaders = new Headers();
  resHeaders.set('Content-Type', res.headers.get('content-type') || 'application/json');
  resHeaders.set('Access-Control-Allow-Origin', '*');
  resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  resHeaders.set('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: resHeaders });
  }

  return new Response(res.body, {
    status: res.status,
    headers: resHeaders,
  });
}
