// generate-thumbnails.js
// 일괄 썸네일 생성 스크립트
// 사용 예) BACKEND_UPLOADS="C:/sutalk-backend/uploads" node generate-thumbnails.js

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const BACKEND_UPLOADS =
  process.env.BACKEND_UPLOADS || path.resolve(process.cwd(), "uploads");

const uploadsDir = path.resolve(BACKEND_UPLOADS);            // 예: C:/.../backend/uploads
const thumbnailsDir = path.join(uploadsDir, "thumbnails");   // 예: C:/.../backend/uploads/thumbnails

const exts = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function isImageFile(file) {
  const ext = path.extname(file).toLowerCase();
  return exts.has(ext);
}

function main() {
  ensureDir(uploadsDir);
  ensureDir(thumbnailsDir);

  const files = fs.readdirSync(uploadsDir, { withFileTypes: true });
  const imageFiles = files
    .filter(
      (d) =>
        d.isFile() &&
        isImageFile(d.name) &&
        !d.name.startsWith("thumb_") && // 원본만 처리
        path.join(uploadsDir, d.name) !== thumbnailsDir // 안전장치
    )
    .map((d) => d.name);

  if (imageFiles.length === 0) {
    console.log("ℹ️ 변환할 이미지가 없습니다.");
    return;
  }

  console.log(`🛠 썸네일 생성 시작 (${imageFiles.length}개)`);

  let ok = 0,
    fail = 0;

  Promise.all(
    imageFiles.map((file) => {
      const inputPath = path.join(uploadsDir, file);
      const outputPath = path.join(thumbnailsDir, `thumb_${file}`);

      // 이미 있으면 스킵
      if (fs.existsSync(outputPath)) {
        console.log(`↪️  스킵(이미 존재): ${path.basename(outputPath)}`);
        ok++;
        return Promise.resolve();
      }

      return sharp(inputPath)
        .resize({ width: 300 })
        .toFile(outputPath)
        .then(() => {
          console.log(`✅ 생성 완료: ${path.basename(outputPath)}`);
          ok++;
        })
        .catch((err) => {
          console.error(`❌ 변환 실패: ${file} → ${err.message}`);
          fail++;
        });
    })
  ).then(() => {
    console.log(`\n🎉 완료: 성공 ${ok} / 실패 ${fail}`);
    console.log(`📁 업로드 폴더: ${uploadsDir}`);
    console.log(`📁 썸네일 폴더: ${thumbnailsDir}`);
  });
}

main();
