#!/bin/bash

# 변수 설정
BUCKET_NAME=sutalk-frontend
DISTRIBUTION_ID=EV4Y1ZX3UP5UI  # ← 네 CloudFront 배포 ID로 바꿔줘
BUILD_DIR=dist

echo "📦 1. Build 시작..."
npm run build

echo "🚀 2. S3에 업로드 중..."
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME --delete

echo "🔄 3. CloudFront 캐시 무효화 중..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "✅ 배포 완료!"
