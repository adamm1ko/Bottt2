/**
 * Keep-Alive Server for Railway
 * يمنع البوت من النوم على Railway ويوفر health check endpoint
 */

const http = require('http');

function startKeepAlive() {
  const PORT = process.env.PORT || 3000;

  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
      }));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>Discord Bot Status</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px; background: #1a1a2e; color: white;">
            <h1>🤖 Discord Bot</h1>
            <p style="color: #00ff88">✅ Bot is Online!</p>
            <p>Uptime: ${Math.floor(process.uptime())}s</p>
            <p><a href="/health" style="color: #5865f2">Health Check JSON</a></p>
          </body>
        </html>
      `);
    }
  });

  server.listen(PORT, () => {
    console.log(`🌐 Keep-alive server running on port ${PORT}`);
  });

  return server;
}

module.exports = { startKeepAlive };
