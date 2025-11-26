/**
 * GuidelineDB CSV 파일에서 특정 라인의 데이터를 가져오는 유틸리티
 */

interface GuidelineRow {
	question: string;
	answer: string;
	category: string;
	적용대상: string;
	출처: string;
}

let guidelineCache: GuidelineRow[] | null = null;

/**
 * GuidelineDB CSV 파일을 로드하고 파싱
 */
async function loadGuidelineDB(): Promise<GuidelineRow[]> {
	if (guidelineCache) {
		return guidelineCache;
	}

	try {
		// Chrome Extension에서는 chrome.runtime.getURL을 사용하거나
		// public 폴더의 파일을 직접 접근
		let response: Response | null = null;
		const paths: string[] = [];

		// Chrome Extension 환경 확인 및 chrome.runtime.getURL 사용
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
				// 다음 경로 시도
				continue;
			}
		}

		if (!response || !response.ok) {
			throw new Error(
				`GuidelineDB.csv 파일을 찾을 수 없습니다. 시도한 경로: ${paths.join(", ")}`,
			);
		}

		const text = await response.text();
		console.log("CSV 파일 로드 성공, 길이:", text.length);
		const lines = text.split("\n");
		console.log("CSV 라인 수:", lines.length);

		// 첫 번째 줄은 헤더이므로 제외
		const rows: GuidelineRow[] = [];
		for (let i = 1; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line) continue;

			// CSV 파싱 (쉼표로 구분, 따옴표 처리)
			const values: string[] = [];
			let current = "";
			let inQuotes = false;

			for (let j = 0; j < line.length; j++) {
				const char = line[j];
				if (char === '"') {
					inQuotes = !inQuotes;
				} else if (char === "," && !inQuotes) {
					values.push(current);
					current = "";
				} else {
					current += char;
				}
			}
			values.push(current);

			if (values.length >= 5) {
				// 출처 컬럼 값 정리 (공백, 줄바꿈 제거)
				const 출처 = (values[4] || "").trim().replace(/\r/g, "");
				rows.push({
					question: values[0] || "",
					answer: values[1] || "",
					category: values[2] || "",
					적용대상: values[3] || "",
					출처: 출처,
				});
			}
		}

		guidelineCache = rows;
		console.log(`GuidelineDB 파싱 완료: ${rows.length}개 행`);
		console.log(
			"첫 5개 행의 출처:",
			rows.slice(0, 5).map((r) => r.출처),
		);
		return rows;
	} catch (error) {
		console.error("Failed to load GuidelineDB:", error);
		return [];
	}
}

/**
 * 라인 번호로 GuidelineDB 데이터 가져오기
 * @param lineNumber 라인 번호 (예: "line5")
 */
export async function getGuidelineByLine(
	lineNumber: string,
): Promise<GuidelineRow | null> {
	const rows = await loadGuidelineDB();
	const lineNum = parseInt(lineNumber.replace("line", ""), 10);

	// CSV는 0-based index이지만, line1이 첫 번째 데이터 행이므로 lineNum - 1
	const index = lineNum - 1;
	if (index >= 0 && index < rows.length) {
		return rows[index];
	}

	return null;
}

/**
 * 텍스트에서 GuidelineDB 참조를 찾아서 추출
 * @param text 검색할 텍스트
 * @returns 찾은 라인 번호 배열 (예: ["line5", "line8"])
 */
export function extractGuidelineReferences(text: string): string[] {
	// GuidelineDB 다음에 나오는 모든 (line숫자) 패턴 찾기
	const guidelineDBRegex = /GuidelineDB[^)]*?/gi;
	const lineNumberRegex = /\(line(\d+)\)/g;
	const lineNumbers = new Set<string>();

	// GuidelineDB가 포함된 부분 찾기
	const guidelineMatches = Array.from(text.matchAll(guidelineDBRegex));

	for (const guidelineMatch of guidelineMatches) {
		if (guidelineMatch.index === undefined) continue;

		// GuidelineDB 다음 부분에서 모든 (line숫자) 찾기
		const startIndex = guidelineMatch.index + guidelineMatch[0].length;
		const remainingText = text.slice(startIndex);

		// 다음 GuidelineDB나 문장 끝까지의 텍스트에서 (line숫자) 찾기
		const nextGuidelineIndex = remainingText.search(/GuidelineDB/gi);
		const searchText =
			nextGuidelineIndex > 0
				? remainingText.slice(0, nextGuidelineIndex)
				: remainingText;

		const lineMatches = Array.from(searchText.matchAll(lineNumberRegex));
		for (const lineMatch of lineMatches) {
			if (lineMatch[1]) {
				lineNumbers.add(`line${lineMatch[1]}`);
			}
		}
	}

	return Array.from(lineNumbers);
}

/**
 * 여러 라인 번호로 GuidelineDB 데이터 가져오기 (출처 컬럼 기준)
 */
export async function getGuidelinesByLines(
	lineNumbers: string[],
): Promise<Map<string, GuidelineRow | null>> {
	const rows = await loadGuidelineDB();
	const result = new Map<string, GuidelineRow | null>();

	for (const lineNumber of lineNumbers) {
		// 출처 컬럼에서 매칭되는 행 찾기 (공백 제거 후 비교)
		const matchedRow = rows.find(
			(row) => row.출처.trim() === lineNumber.trim(),
		);
		if (matchedRow) {
			result.set(lineNumber, matchedRow);
		} else {
			// 디버깅: 매칭 실패 시 로그 출력
			console.warn(
				`GuidelineDB에서 "${lineNumber}"를 찾을 수 없습니다.`,
				`사용 가능한 출처:`,
				rows.slice(0, 5).map((r) => r.출처),
			);
			result.set(lineNumber, null);
		}
	}

	return result;
}

/**
 * 텍스트에서 GuidelineDB 참조 위치와 함께 추출
 * @param text 검색할 텍스트
 * @returns 참조 정보 배열 (라인 번호와 텍스트 내 위치)
 */
export interface GuidelineReference {
	lineNumber: string;
	startIndex: number;
	endIndex: number;
	text: string;
}

export function extractGuidelineReferencesWithPositions(
	text: string,
): GuidelineReference[] {
	const matches: GuidelineReference[] = [];
	const lineNumberRegex = /\(line(\d+)\)/g;

	// GuidelineDB가 포함된 부분 찾기
	const guidelineDBRegex = /GuidelineDB[^)]*?/gi;
	const guidelineMatches = Array.from(text.matchAll(guidelineDBRegex));

	for (const guidelineMatch of guidelineMatches) {
		if (guidelineMatch.index === undefined) continue;

		const guidelineEndIndex = guidelineMatch.index + guidelineMatch[0].length;

		// GuidelineDB 다음 부분에서 모든 (line숫자) 찾기
		const remainingText = text.slice(guidelineEndIndex);

		// 다음 GuidelineDB나 문장 끝까지의 텍스트에서 (line숫자) 찾기
		const nextGuidelineIndex = remainingText.search(/GuidelineDB/gi);
		const searchText =
			nextGuidelineIndex > 0
				? remainingText.slice(0, nextGuidelineIndex)
				: remainingText;

		// searchText에서 모든 (line숫자) 패턴 찾기
		const lineMatches = Array.from(searchText.matchAll(lineNumberRegex));
		for (const lineMatch of lineMatches) {
			if (lineMatch.index !== undefined && lineMatch[1]) {
				const absoluteStartIndex = guidelineEndIndex + lineMatch.index;
				const absoluteEndIndex = absoluteStartIndex + lineMatch[0].length;

				matches.push({
					lineNumber: `line${lineMatch[1]}`,
					startIndex: absoluteStartIndex,
					endIndex: absoluteEndIndex,
					text: lineMatch[0],
				});
			}
		}
	}

	return matches;
}
