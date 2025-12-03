/**
 * WebAssembly 기반 GuidelineDB 파서 래퍼
 * Rust로 구현된 고성능 CSV 파서 및 참조 추출기
 */

import init, {
	CsvParser,
	type GuidelineReference,
	type GuidelineRow,
	ReferenceExtractor,
} from "../../wasm-parser/pkg/guideline_parser_wasm";

let wasmInitialized = false;

/**
 * WebAssembly 모듈 초기화
 */
export async function initWasm(): Promise<void> {
	if (!wasmInitialized) {
		await init();
		wasmInitialized = true;
	}
}

/**
 * GuidelineDB CSV 파일을 로드하고 파싱
 */
let guidelineCache: GuidelineRow[] | null = null;
let csvParser: CsvParser | null = null;

export async function loadGuidelineDB(): Promise<GuidelineRow[]> {
	if (guidelineCache) {
		return guidelineCache;
	}

	await initWasm();

	try {
		// Chrome Extension 환경 확인 및 chrome.runtime.getURL 사용
		let response: Response | null = null;
		const paths: string[] = [];

		// @ts-expect-error - Chrome Extension API는 런타임에만 존재
		if (typeof chrome !== "undefined" && chrome?.runtime?.getURL) {
			try {
				// @ts-expect-error - Chrome Extension API는 런타임에만 존재
				const url = chrome.runtime.getURL("/GuidelineDB.csv");
				paths.push(url);
			} catch {
				// chrome.runtime.getURL이 실패하면 일반 경로 시도
			}
		}

		// 일반 웹 경로들 추가 (public 폴더의 파일)
		paths.push("/GuidelineDB.csv", "./GuidelineDB.csv");

		for (const path of paths) {
			try {
				const testResponse = await fetch(path);
				if (testResponse.ok) {
					response = testResponse;
					console.log(`GuidelineDB CSV 파일을 ${path}에서 로드했습니다.`);
					break;
				}
			} catch (error) {
				console.warn(`경로 ${path}에서 로드 실패:`, error);
			}
		}

		if (!response || !response.ok) {
			throw new Error(
				`GuidelineDB.csv 파일을 찾을 수 없습니다. 시도한 경로: ${paths.join(", ")}`,
			);
		}

		const text = await response.text();
		console.log("CSV 파일 로드 성공, 길이:", text.length);

		// WebAssembly 파서 사용
		if (!csvParser) {
			csvParser = new CsvParser();
		}

		const parseResult = csvParser.parse_csv(text);
		const result = parseResult as unknown as {
			rows: GuidelineRow[];
			error: string | null;
		};

		if (result.error) {
			throw new Error(result.error);
		}

		guidelineCache = result.rows;
		console.log(
			`GuidelineDB 파싱 완료: ${result.rows.length}개 행 (WebAssembly 사용)`,
		);
		return result.rows;
	} catch (error) {
		console.error("Failed to load GuidelineDB:", error);
		return [];
	}
}

/**
 * 라인 번호로 GuidelineDB 데이터 가져오기
 */
export async function getGuidelineByLine(
	lineNumber: string,
): Promise<GuidelineRow | null> {
	await initWasm();

	if (!csvParser) {
		await loadGuidelineDB();
	}

	if (!csvParser) {
		return null;
	}

	const result = csvParser.get_by_line_number(
		lineNumber,
	) as unknown as GuidelineRow | null;
	return result;
}

/**
 * 여러 라인 번호로 GuidelineDB 데이터 가져오기 (출처 컬럼 기준)
 */
export async function getGuidelinesByLines(
	lineNumbers: string[],
): Promise<Map<string, GuidelineRow | null>> {
	await initWasm();

	if (!csvParser) {
		await loadGuidelineDB();
	}

	if (!csvParser) {
		return new Map();
	}

	const result = csvParser.get_by_line_numbers(
		lineNumbers,
	) as unknown as Record<string, GuidelineRow | null>;

	const map = new Map<string, GuidelineRow | null>();
	for (const [key, value] of Object.entries(result)) {
		map.set(key, value);
	}

	return map;
}

/**
 * 텍스트에서 GuidelineDB 참조를 찾아서 추출
 */
export function extractGuidelineReferences(text: string): string[] {
	if (!wasmInitialized) {
		console.warn(
			"WebAssembly가 초기화되지 않았습니다. 동기 초기화는 지원되지 않습니다.",
		);
		return [];
	}

	try {
		const result = ReferenceExtractor.extract_references(
			text,
		) as unknown as string[];
		return result;
	} catch (error) {
		console.error("참조 추출 실패:", error);
		return [];
	}
}

/**
 * 텍스트에서 GuidelineDB 참조 위치와 함께 추출
 */
export function extractGuidelineReferencesWithPositions(
	text: string,
): GuidelineReference[] {
	if (!wasmInitialized) {
		console.warn(
			"WebAssembly가 초기화되지 않았습니다. 동기 초기화는 지원되지 않습니다.",
		);
		return [];
	}

	try {
		const result = ReferenceExtractor.extract_references_with_positions(
			text,
		) as unknown as GuidelineReference[];
		return result;
	} catch (error) {
		console.error("참조 추출 실패:", error);
		return [];
	}
}

// 기존 guideline.ts와의 호환성을 위한 타입 재export
export type { GuidelineReference };
