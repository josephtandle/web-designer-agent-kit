#!/usr/bin/env node

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function printUsage() {
  console.log(`
Masterminds Web Designer : Local Static Server

Usage:
  node scripts/preview.mjs [--dir=<directory>] [--port=<port>]

Options:
  --dir=<path>, -d <path>   Directory to serve public assets from (default: .)
  --port=<port>, -p <port> Port number to bind server to (default: 3000)
  --help, -h                Show this help message

Security:
  - Binds strictly to 127.0.0.1 (loopback interface ONLY)
  - Path traversal protected via path.relative boundary check
  - Symlink escapes forbidden
  - Public asset whitelist enforced (HTML/CSS/JS/images/fonts only; dotfiles/markdown/json refused)
`);
}

function parseArgs(args) {
  let dir = '.';
  let port = 3000;
  let help = false;
  const allowedFlags = new Set(['dir', 'port', 'd', 'p', 'help', 'h']);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      help = true;
    } else if (arg.startsWith('--dir=')) {
      dir = arg.slice('--dir='.length);
    } else if (arg === '-d' && i + 1 < args.length) {
      dir = args[++i];
    } else if (arg.startsWith('--port=')) {
      port = parseInt(arg.slice('--port='.length), 10);
    } else if (arg === '-p' && i + 1 < args.length) {
      port = parseInt(args[++i], 10);
    } else if (arg.startsWith('-')) {
      console.error(`Error: Unknown option '${arg}'.`);
      printUsage();
      process.exit(1);
    } else {
      dir = arg;
    }
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`Error: Invalid port number '${port}'. Must be an integer between 1 and 65535.`);
    process.exit(1);
  }

  return { dir, port, help };
}

function serveStaticServer(rootDir, port) {
  const rootDirPath = path.resolve(rootDir);

  if (!fs.existsSync(rootDirPath)) {
    console.error(`Error: Directory '${rootDirPath}' does not exist.`);
    process.exit(1);
  }

  let realRootDirPath;
  try {
    realRootDirPath = fs.realpathSync(rootDirPath);
  } catch (err) {
    console.error(`Error: Failed to resolve path '${rootDirPath}': ${err.message}`);
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('405 Method Not Allowed');
      return;
    }

    try {
      const parsedUrl = new URL(req.url, `http://127.0.0.1:${port}`);
      const rawPathname = parsedUrl.pathname;

      // Reject hidden or dotfile segments BEFORE normalization
      const rawSegments = rawPathname.split('/').filter(Boolean);
      for (const seg of rawSegments) {
        const decodedSeg = decodeURIComponent(seg);
        if (decodedSeg.startsWith('.') || decodedSeg.includes('..')) {
          res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('403 Forbidden: Access to hidden or dotfiles is private.');
          return;
        }
      }

      const decodedPath = decodeURIComponent(rawPathname);
      const normalizedPath = path.normalize(decodedPath);
      let filePath = path.join(rootDirPath, normalizedPath);

      // Path relative containment safety check
      const resolvedFilePath = path.resolve(filePath);
      const relFromRoot = path.relative(rootDirPath, resolvedFilePath);
      if (relFromRoot.startsWith('..') || path.isAbsolute(relFromRoot)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden: Path traversal detected.');
        return;
      }

      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }

      let stat = fs.statSync(filePath);
      let targetFilePath = filePath;
      if (stat.isDirectory()) {
        targetFilePath = path.join(filePath, 'index.html');
        if (!fs.existsSync(targetFilePath)) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found: Directory index.html missing.');
          return;
        }
      }

      // Check for symbolic link
      const lstat = fs.lstatSync(targetFilePath);
      if (lstat.isSymbolicLink()) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden: Symbolic links are refused.');
        return;
      }

      // Check realpath boundary using path.relative (fixes prefix bug)
      const realFilePath = fs.realpathSync(targetFilePath);
      const relFromRealRoot = path.relative(realRootDirPath, realFilePath);
      if (relFromRealRoot.startsWith('..') || path.isAbsolute(relFromRealRoot)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden: File escapes document root.');
        return;
      }

      const ext = path.extname(targetFilePath).toLowerCase();
      const mimeType = ALLOWED_MIME_TYPES[ext];

      if (!mimeType) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`403 Forbidden: File type '${ext}' is not permitted for public preview.`);
        return;
      }

      const fileStat = fs.statSync(targetFilePath);
      res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': fileStat.size,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      });

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      const stream = fs.createReadStream(targetFilePath);
      stream.pipe(res);
      stream.on('error', (err) => {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('500 Internal Server Error');
        }
      });
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`400 Bad Request: ${err.message}`);
      }
    }
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`
Preview server running at http://127.0.0.1:${port}/
Serving directory: ${realRootDirPath}
Binding interface: 127.0.0.1 ONLY
Safety mode: Path-traversal blocked via path.relative, dotfiles hidden, symlinks refused.

Press Ctrl+C to stop the server.
`);
  });

  server.on('error', (err) => {
    console.error(`Server error: ${err.message}`);
    process.exit(1);
  });
}

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  serveStaticServer(options.dir, options.port);
}

main();
