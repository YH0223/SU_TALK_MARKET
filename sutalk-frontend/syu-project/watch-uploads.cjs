// watch-uploads.cjs
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// 백엔드의 app.upload-dir 과 반드시 동일한 절대경로
const BACKEND_UPLOADS = process.env.BACKEND_UPLOADS || "C:/sutalk/uploads"; // ★ 바꾸기

const uploadsDir = path.resolve(BACKEND_UPLOADS);
const thumbnailsDir = path.join(uploadsDir, "thumbnails");

if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

const exts = new Set([".png", ".jpg", ".jpeg", ".webp"]);
console.log("👀 백엔드 업로드 폴더 감시 시작:", uploadsDir);

fs.watch(uploadsDir, (eventType, filename) => {
  if (!filename) return;
  const ext = path.extname(filename).toLowerCase();
  if (!exts.has(ext)) return;
  if (filename.startsWith("thumb_")) return;

  const inputPath = path.join(uploadsDir, filename);
  const outputPath = path.join(thumbnailsDir, `thumb_${filename}`);
  if (fs.existsSync(outputPath)) return;

  setTimeout(() => {
    sharp(inputPath)
      .resize({ width: 300 })
      .toFile(outputPath)
      .then(() => console.log(`✅ 썸네일 생성: ${path.basename(outputPath)}`))
      .catch((err) => console.error(`❌ 썸네일 생성 실패: ${filename}`, err.message));
  }, 500);
});
