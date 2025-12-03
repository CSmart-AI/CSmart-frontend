use regex::Regex;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// GuidelineDB 행 데이터 구조
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GuidelineRow {
    pub question: String,
    pub answer: String,
    pub category: String,
    #[serde(rename = "적용대상")]
    pub applicable_target: String,
    #[serde(rename = "출처")]
    pub source: String,
}

/// GuidelineDB 참조 정보
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GuidelineReference {
    pub line_number: String,
    pub start_index: usize,
    pub end_index: usize,
    pub text: String,
}

/// CSV 파싱 결과
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParseResult {
    pub rows: Vec<GuidelineRow>,
    pub error: Option<String>,
}

/// CSV 파서 구조체
#[wasm_bindgen]
pub struct CsvParser {
    rows: Vec<GuidelineRow>,
}

#[wasm_bindgen]
impl CsvParser {
    /// 새로운 CSV 파서 생성
    #[wasm_bindgen(constructor)]
    pub fn new() -> CsvParser {
        CsvParser { rows: Vec::new() }
    }

    /// CSV 텍스트를 파싱하여 GuidelineRow 벡터로 변환
    #[wasm_bindgen]
    pub fn parse_csv(&mut self, csv_text: &str) -> Result<JsValue, JsValue> {
        let rows = parse_csv_internal(csv_text)?;
        self.rows = rows.clone();

        let result = ParseResult {
            rows,
            error: None,
        };

        serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&format!("직렬화 오류: {}", e)))
    }

    /// 라인 번호로 GuidelineRow 가져오기
    #[wasm_bindgen]
    pub fn get_by_line_number(&self, line_number: &str) -> Result<JsValue, JsValue> {
        let line_num = line_number
            .replace("line", "")
            .parse::<usize>()
            .map_err(|_| JsValue::from_str("유효하지 않은 라인 번호"))?;

        // line1이 첫 번째 데이터 행이므로 line_num - 1
        let index = line_num.saturating_sub(1);

        if index < self.rows.len() {
            serde_wasm_bindgen::to_value(&self.rows[index])
                .map_err(|e| JsValue::from_str(&format!("직렬화 오류: {}", e)))
        } else {
            serde_wasm_bindgen::to_value::<Option<GuidelineRow>>(&None)
                .map_err(|e| JsValue::from_str(&format!("직렬화 오류: {}", e)))
        }
    }

    /// 여러 라인 번호로 GuidelineRow 가져오기 (출처 컬럼 기준)
    #[wasm_bindgen]
    pub fn get_by_line_numbers(&self, line_numbers: &[String]) -> Result<JsValue, JsValue> {
        use std::collections::HashMap;

        let mut result: HashMap<String, Option<GuidelineRow>> = HashMap::new();

        for line_number in line_numbers {
            let trimmed = line_number.trim();
            let matched_row = self
                .rows
                .iter()
                .find(|row| row.source.trim() == trimmed)
                .cloned();

            result.insert(line_number.clone(), matched_row);
        }

        serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&format!("직렬화 오류: {}", e)))
    }

    /// 파싱된 행의 개수 반환
    #[wasm_bindgen]
    pub fn row_count(&self) -> usize {
        self.rows.len()
    }
}

/// 내부 CSV 파싱 함수 (따옴표 처리 포함)
fn parse_csv_internal(csv_text: &str) -> Result<Vec<GuidelineRow>, JsValue> {
    let lines: Vec<&str> = csv_text.split('\n').collect();
    let mut rows = Vec::new();

    // 첫 번째 줄은 헤더이므로 제외
    for line in lines.iter().skip(1) {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        let values = parse_csv_line(trimmed)?;

        if values.len() >= 5 {
            let source = values[4].trim().replace('\r', "");
            rows.push(GuidelineRow {
                question: values[0].to_string(),
                answer: values[1].to_string(),
                category: values[2].to_string(),
                applicable_target: values[3].to_string(),
                source,
            });
        }
    }

    Ok(rows)
}

/// CSV 라인 파싱 (따옴표 처리)
fn parse_csv_line(line: &str) -> Result<Vec<String>, JsValue> {
    let mut values = Vec::new();
    let mut current = String::new();
    let mut in_quotes = false;
    let chars: Vec<char> = line.chars().collect();

    let mut i = 0;
    while i < chars.len() {
        let ch = chars[i];

        match ch {
            '"' => {
                in_quotes = !in_quotes;
            }
            ',' if !in_quotes => {
                values.push(current.clone());
                current.clear();
            }
            _ => {
                current.push(ch);
            }
        }
        i += 1;
    }

    // 마지막 값 추가
    values.push(current);

    Ok(values)
}

/// GuidelineDB 참조 추출기
#[wasm_bindgen]
pub struct ReferenceExtractor;

#[wasm_bindgen]
impl ReferenceExtractor {
    /// 텍스트에서 GuidelineDB 참조 라인 번호 추출
    #[wasm_bindgen]
    pub fn extract_references(text: &str) -> Result<JsValue, JsValue> {
        let guideline_db_regex = Regex::new(r"(?i)GuidelineDB[^)]*?").unwrap();
        let line_number_regex = Regex::new(r"\(line(\d+)\)").unwrap();
        let mut line_numbers = std::collections::HashSet::new();

        for guideline_match in guideline_db_regex.find_iter(text) {
            let start_index = guideline_match.end();
            let remaining_text = &text[start_index..];

            // 다음 GuidelineDB까지의 텍스트 찾기
            let next_guideline = Regex::new(r"(?i)GuidelineDB")
                .unwrap()
                .find(remaining_text);

            let search_text = if let Some(next_match) = next_guideline {
                &remaining_text[..next_match.start()]
            } else {
                remaining_text
            };

            // (line숫자) 패턴 찾기
            for line_match in line_number_regex.find_iter(search_text) {
                if let Some(captures) = line_number_regex.captures(line_match.as_str()) {
                    if let Some(line_num) = captures.get(1) {
                        line_numbers.insert(format!("line{}", line_num.as_str()));
                    }
                }
            }
        }

        let result: Vec<String> = line_numbers.into_iter().collect();
        serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&format!("직렬화 오류: {}", e)))
    }

    /// 텍스트에서 GuidelineDB 참조 위치 정보와 함께 추출
    #[wasm_bindgen]
    pub fn extract_references_with_positions(text: &str) -> Result<JsValue, JsValue> {
        let guideline_db_regex = Regex::new(r"(?i)GuidelineDB").unwrap();
        let line_number_regex = Regex::new(r"\(line(\d+)\)").unwrap();
        let mut matches: Vec<GuidelineReference> = Vec::new();

        for db_match in guideline_db_regex.find_iter(text) {
            let db_start_index = db_match.start();
            let db_end_index = db_match.end();

            // GuidelineDB 앞에서 가장 가까운 여는 괄호 찾기 (중첩된 괄호 고려)
            let open_bracket_index = find_open_bracket(text, db_start_index);

            // GuidelineDB 뒤에서 가장 가까운 닫는 괄호 찾기 (중첩된 괄호 고려)
            let close_bracket_index = find_close_bracket(text, db_end_index);

            if let (Some(open_idx), Some(close_idx)) = (open_bracket_index, close_bracket_index) {
                let bracket_text = &text[open_idx..=close_idx];

                // 괄호 블록 내에서 모든 (line숫자) 패턴 찾기
                for line_match in line_number_regex.find_iter(bracket_text) {
                    if let Some(captures) = line_number_regex.captures(line_match.as_str()) {
                        if let Some(line_num) = captures.get(1) {
                            let line_number = format!("line{}", line_num.as_str());
                            let line_text = line_match.as_str();
                            let line_start_index = open_idx + line_match.start();
                            let line_end_index = line_start_index + line_text.len();

                            // 중복 체크
                            let is_duplicate = matches.iter().any(|m| {
                                m.start_index == line_start_index && m.end_index == line_end_index
                            });

                            if !is_duplicate {
                                matches.push(GuidelineReference {
                                    line_number,
                                    start_index: line_start_index,
                                    end_index: line_end_index,
                                    text: line_text.to_string(),
                                });
                            }
                        }
                    }
                }

                // line 숫자가 없으면 GuidelineDB가 포함된 괄호 전체를 하이라이트
                if !line_number_regex.is_match(bracket_text) {
                    let is_duplicate = matches.iter().any(|m| {
                        m.start_index == open_idx && m.end_index == close_idx + 1
                    });

                    if !is_duplicate {
                        matches.push(GuidelineReference {
                            line_number: String::new(),
                            start_index: open_idx,
                            end_index: close_idx + 1,
                            text: bracket_text.to_string(),
                        });
                    }
                }
            }
        }

        // start_index 기준으로 정렬
        matches.sort_by_key(|m| m.start_index);

        serde_wasm_bindgen::to_value(&matches)
            .map_err(|e| JsValue::from_str(&format!("직렬화 오류: {}", e)))
    }
}

/// GuidelineDB 앞에서 가장 가까운 여는 괄호 찾기 (중첩된 괄호 고려)
fn find_open_bracket(text: &str, start_pos: usize) -> Option<usize> {
    let mut bracket_depth = 0;

    for i in (0..start_pos).rev() {
        let ch = text.chars().nth(i)?;
        match ch {
            ')' => bracket_depth += 1,
            '(' => {
                if bracket_depth == 0 {
                    return Some(i);
                }
                bracket_depth -= 1;
            }
            _ => {}
        }
    }

    None
}

/// GuidelineDB 뒤에서 가장 가까운 닫는 괄호 찾기 (중첩된 괄호 고려)
fn find_close_bracket(text: &str, start_pos: usize) -> Option<usize> {
    let mut bracket_depth = 0;
    let chars: Vec<char> = text.chars().collect();

    for i in start_pos..chars.len() {
        let ch = chars[i];
        match ch {
            '(' => bracket_depth += 1,
            ')' => {
                if bracket_depth == 0 {
                    return Some(i);
                }
                bracket_depth -= 1;
            }
            _ => {}
        }
    }

    None
}

/// wasm-bindgen 초기화
#[wasm_bindgen(start)]
pub fn init() {
    // 콘솔 에러 패닉 핸들러 설정
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

/// 콘솔 로깅 매크로
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

