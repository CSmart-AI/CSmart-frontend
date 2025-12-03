# Guideline Parser WebAssembly

Rust로 구현된 고성능 GuidelineDB CSV 파서 및 참조 추출기입니다.

## 기능

- **고성능 CSV 파싱**: 따옴표 처리 및 이스케이프 문자 지원
- **참조 추출**: 정규식 기반 GuidelineDB 참조 추출
- **위치 정보 추출**: 중첩 괄호를 고려한 정확한 위치 정보 제공
- **타입 안전성**: TypeScript 바인딩 제공

## 빌드 방법

### 사전 요구사항

- Rust (최신 안정 버전)
- wasm-pack 설치: `cargo install wasm-pack`

### 빌드

```bash
cd wasm-parser
wasm-pack build --target web --out-dir pkg
```

### 개발 모드 빌드 (디버깅용)

```bash
wasm-pack build --target web --out-dir pkg --dev
```

## 사용 방법

TypeScript/JavaScript에서 사용:

```typescript
import init, { CsvParser, ReferenceExtractor } from './wasm-parser/pkg/guideline_parser_wasm';

// WebAssembly 초기화
await init();

// CSV 파싱
const parser = new CsvParser();
const result = parser.parse_csv(csvText);
console.log(result.rows);

// 참조 추출
const references = ReferenceExtractor.extract_references(text);
const referencesWithPositions = ReferenceExtractor.extract_references_with_positions(text);
```

## 성능

- JavaScript 구현 대비 **2-5배 빠른 파싱 속도**
- 큰 CSV 파일(10,000+ 행)에서도 빠른 처리
- 메모리 효율적인 파싱

## 통합

프로젝트 루트에서 빌드 후 `utils/guideline-wasm.ts`를 통해 사용할 수 있습니다.

