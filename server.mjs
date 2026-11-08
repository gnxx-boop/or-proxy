import http from 'node:http';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  // 1. 放行 CORS 跨域预检
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const targetUrl = 'https://openrouter.ai' + req.url;

    const cleanHeaders = {};
    if (req.headers['authorization']) {
      cleanHeaders['Authorization'] = req.headers['authorization'];
    }
    if (req.headers['content-type']) {
      cleanHeaders['Content-Type'] = req.headers['content-type'];
    }
    cleanHeaders['HTTP-Referer'] = 'https://chatboxai.app';
    cleanHeaders['X-Title'] = 'Chatbox';

    // 读取完整的 POST 请求内容
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    // 由美国本土服务器向 OpenRouter 发起无超时限制的请求
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: cleanHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? bodyBuffer : undefined,
      redirect: 'manual',
    });

    res.writeHead(upstreamRes.status, {
      'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // 源源不断地将流式文字实时推回给你的 Chatbox，永不断流！
    if (upstreamRes.body) {
      for await (const chunk of upstreamRes.body) {
        res.write(chunk);
      }
    }
    res.end();
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
