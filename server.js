const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8001;
const ROOT = path.join(__dirname, 'tests');
const DEFAULT = '/index.html';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.md':   'text/markdown'
};

http.createServer((req, res) => {
  const url = req.url === '/' ? DEFAULT : req.url.split('?')[0];
  const filePath = path.join(ROOT, url);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + url);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log('HL7 FHIR Study rodando em http://localhost:' + PORT + DEFAULT);
});
