// Static UI verification only. Auth is signed out; writes require a deployed service
// or the isolated transport explicitly supplied by browser contract tests.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("public");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:8889");
  if (url.pathname === "/api/auth" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ user: null }));
  }
  if (url.pathname.startsWith("/api/")) {
    res.writeHead(503, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        error:
          "This static preview cannot save cases or run AI. Use Netlify dev for connected services.",
      }),
    );
  }
  const path = resolve(
    root,
    "." +
      decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname),
  );
  if (!path.startsWith(root + sep)) {
    res.writeHead(403);
    return res.end();
  }
  try {
    const body = await readFile(path);
    res.writeHead(200, {
      "Content-Type": types[extname(path)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
server.listen(8889, "127.0.0.1", () =>
  console.log("Static UI preview: http://localhost:8889"),
);
