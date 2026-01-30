#!/usr/bin/env node

/**
 * Simple dev server for easto output
 * Serves files without extensions as text/html
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;
const OUTPUT_DIR = path.join(__dirname, "output");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
};

const server = http.createServer((req, res) => {
  let filePath = path.join(
    OUTPUT_DIR,
    req.url === "/" ? "index.html" : req.url,
  );

  // Try to find the file
  if (!fs.existsSync(filePath)) {
    // If file doesn't exist, return 404
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not Found</h1>");
    return;
  }

  // Check if it's a directory
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    filePath = path.join(filePath, "index.html");
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 Not Found</h1>");
      return;
    }
  }

  // Determine content type
  const ext = path.extname(filePath).toLowerCase();
  let contentType = MIME_TYPES[ext] || "text/html";

  // If no extension, assume HTML
  if (!ext) {
    contentType = "text/html";
  }

  // Read and serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end("<h1>500 Internal Server Error</h1>");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);

    console.log(`${req.method} ${req.url} → ${filePath} (${contentType})`);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Easto dev server running at http://localhost:${PORT}/\n`);
  console.log(`Serving: ${OUTPUT_DIR}`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
