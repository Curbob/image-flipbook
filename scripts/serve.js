#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORTS_TO_TRY = [8080, 8001, 8002, 3000, 9000];
let PORT;
const root = path.join(__dirname, '..');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(root, req.url === '/' ? '/examples/basic.html' : req.url);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(root)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    const ext = path.extname(filePath);
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content);
        }
    });
});

function tryPort(ports, index = 0) {
    if (index >= ports.length) {
        console.error('❌ All ports are in use! Try stopping other servers first.');
        process.exit(1);
    }
    
    PORT = ports[index];
    
    server.listen(PORT, () => {
        console.log(`🚀 ImageFlipbook dev server running at:`);
        console.log(`📖 Basic Example: http://localhost:${PORT}/examples/basic.html`);
        console.log(`⚔️ Medieval Example: http://localhost:${PORT}/examples/medieval.html`);
        console.log(`\nPress Ctrl+C to stop`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            tryPort(ports, index + 1);
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
}

tryPort(PORTS_TO_TRY);