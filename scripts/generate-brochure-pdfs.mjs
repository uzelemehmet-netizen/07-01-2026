import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const docsDir = path.join(publicDir, "docs");
const outDir = path.join(docsDir, "pdf");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const normalized = path.posix
    .normalize(decoded)
    .replace(/^\/+/, "")
    .replace(/\0/g, "");
  const fsPath = path.join(root, ...normalized.split("/"));
  const resolved = path.resolve(fsPath);
  if (!resolved.startsWith(path.resolve(root))) {
    return null;
  }
  return resolved;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function startStaticServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://localhost");
      let reqPath = url.pathname;
      if (reqPath.endsWith("/")) reqPath += "index.html";

      const target = safeJoin(publicDir, reqPath);
      if (!target) {
        res.writeHead(400);
        res.end("Bad Request");
        return;
      }

      let finalPath = target;
      if (!(await fileExists(finalPath))) {
        // fallback: try .html for extensionless routes
        if (!path.extname(finalPath) && (await fileExists(finalPath + ".html"))) {
          finalPath = finalPath + ".html";
        } else {
          res.writeHead(404);
          res.end("Not Found");
          return;
        }
      }

      const ext = path.extname(finalPath).toLowerCase();
      const mime = MIME[ext] || "application/octet-stream";
      const data = await fs.readFile(finalPath);
      res.writeHead(200, { "Content-Type": mime, "Cache-Control": "no-store" });
      res.end(data);
    } catch (err) {
      res.writeHead(500);
      res.end("Internal Server Error");
      // eslint-disable-next-line no-console
      console.error("[pdf-server]", err);
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Failed to start server");
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  return { server, baseUrl };
}

async function listBrochurePages() {
  const entries = await fs.readdir(docsDir);

  const pages = [];

  // V2 tur broşürleri
  for (const name of entries) {
    if (/^tur-brosuru-.*-v2\.html$/i.test(name)) {
      pages.push({
        inPath: `/docs/${name}`,
        outName: name.replace(/\.html$/i, ".pdf"),
      });
    }
  }

  // Bali özel broşürü (legacy)
  if (entries.includes("bali-tatil-brosuru.html")) {
    pages.push({ inPath: "/docs/bali-tatil-brosuru.html", outName: "bali-tatil-brosuru.pdf" });
  }

  // Ön kayıt bilgi paketi (opsiyonel ama sitede PDF diye geçiyor)
  if (entries.includes("on-kayit-bilgi-paketi.html")) {
    pages.push({ inPath: "/docs/on-kayit-bilgi-paketi.html", outName: "on-kayit-bilgi-paketi.pdf" });
  }

  pages.sort((a, b) => a.outName.localeCompare(b.outName));
  return pages;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function isStrictMode() {
  return process.argv.includes("--strict") || process.env.BROCHURE_PDF_STRICT === "1";
}

function isPlaywrightSetupError(err) {
  const msg = String(err?.message || err || "");
  return (
    msg.includes("Executable doesn't exist") ||
    msg.includes("browserType.launch") ||
    msg.includes("playwright install") ||
    msg.includes(".cache/ms-playwright") ||
    msg.includes("error while loading shared libraries") ||
    msg.includes("libnspr4.so") ||
    msg.includes("libnss3.so")
  );
}

async function main() {
  await ensureDir(outDir);

  const pages = await listBrochurePages();
  if (pages.length === 0) {
    // eslint-disable-next-line no-console
    console.log("[pdf] No brochure pages found under public/docs");
    return;
  }

  const strict = isStrictMode();

  let server;
  let baseUrl;
  let browser;
  let context;

  try {
    try {
      browser = await chromium.launch();
      context = await browser.newContext({ locale: "tr-TR" });
    } catch (err) {
      if (isPlaywrightSetupError(err) && !strict) {
        // eslint-disable-next-line no-console
        console.warn(
          "[pdf] Playwright tarayıcısı bulunamadı; PDF üretimi atlandı. (Build kırılmadı)\n" +
            "[pdf] Çözüm (tarayıcı): npx playwright install chromium\n" +
            "[pdf] Çözüm (Linux bağımlılıkları): sudo npx playwright install-deps chromium\n" +
            "[pdf] Alternatif: npm run playwright:install (ve WSL/Linux için npm run playwright:install:deps)\n" +
            "[pdf] Zorunlu kılmak için: node scripts/generate-brochure-pdfs.mjs --strict (veya BROCHURE_PDF_STRICT=1)"
        );
        return;
      }
      throw err;
    }

    ({ server, baseUrl } = await startStaticServer());

    // eslint-disable-next-line no-console
    console.log(`[pdf] Generating ${pages.length} PDF(s) into ${path.relative(projectRoot, outDir)}`);

    for (const item of pages) {
      const page = await context.newPage();
      const url = `${baseUrl}${item.inPath}`;
      const outPath = path.join(outDir, item.outName);

      // eslint-disable-next-line no-console
      console.log(`[pdf] ${item.inPath} -> docs/pdf/${item.outName}`);

      await page.goto(url, { waitUntil: "networkidle" });

      // A4 + arkaplanlar açık; CSS print ayarları devreye girsin
      await page.emulateMedia({ media: "print" });
      await page.pdf({
        path: outPath,
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });

      await page.close();
    }
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
    if (server) await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[pdf] Failed:", err);
  process.exitCode = 1;
});
