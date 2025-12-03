#!/bin/bash

# WebAssembly 빌드 스크립트

set -e

echo "🔨 Guideline Parser WebAssembly 빌드 시작..."

# wasm-pack이 설치되어 있는지 확인
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack이 설치되어 있지 않습니다."
    echo "설치 방법: cargo install wasm-pack"
    exit 1
fi

# 빌드 디렉토리로 이동
cd "$(dirname "$0")"

# 이전 빌드 결과물 정리
echo "🧹 이전 빌드 결과물 정리 중..."
rm -rf pkg

# WebAssembly 빌드
echo "📦 WebAssembly 빌드 중..."
wasm-pack build --target web --out-dir pkg

echo "✅ 빌드 완료!"
echo "📁 출력 디렉토리: pkg/"

