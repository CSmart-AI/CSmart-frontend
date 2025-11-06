import { Temporal } from "temporal-polyfill";

/**
 * Temporal polyfill 유틸리티 함수들
 */

/**
 * 현재 시간을 Temporal.PlainDateTime으로 반환
 */
export function getNow(): Temporal.PlainDateTime {
	return Temporal.Now.plainDateTimeISO();
}

/**
 * ISO 문자열을 Temporal.PlainDateTime으로 변환
 */
export function fromISO(isoString: string): Temporal.PlainDateTime {
	return Temporal.PlainDateTime.from(isoString);
}

/**
 * 날짜 문자열(YYYY-MM-DD)을 Temporal.PlainDate로 변환
 */
export function fromDateString(dateString: string): Temporal.PlainDate {
	return Temporal.PlainDate.from(dateString);
}

/**
 * Temporal.PlainDateTime을 로케일 문자열로 포맷
 */
export function formatDateTime(
	dateTime: Temporal.PlainDateTime,
	options?: Intl.DateTimeFormatOptions,
): string {
	const date = new Date(
		dateTime.year,
		dateTime.month - 1,
		dateTime.day,
		dateTime.hour,
		dateTime.minute,
		dateTime.second,
	);
	return date.toLocaleString("ko-KR", options);
}

/**
 * Temporal.PlainDate를 로케일 문자열로 포맷
 */
export function formatDate(
	date: Temporal.PlainDate,
	options?: Intl.DateTimeFormatOptions,
): string {
	const jsDate = new Date(date.year, date.month - 1, date.day);
	return jsDate.toLocaleDateString("ko-KR", options);
}

/**
 * Temporal.PlainTime을 로케일 문자열로 포맷
 */
export function formatTime(
	time: Temporal.PlainTime,
	options?: Intl.DateTimeFormatOptions,
): string {
	const jsDate = new Date(2000, 0, 1, time.hour, time.minute, time.second);
	return jsDate.toLocaleTimeString("ko-KR", options);
}

/**
 * Date 객체를 Temporal.PlainDateTime으로 변환
 */
export function fromJSDate(date: Date): Temporal.PlainDateTime {
	return Temporal.PlainDateTime.from({
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
		hour: date.getHours(),
		minute: date.getMinutes(),
		second: date.getSeconds(),
		millisecond: date.getMilliseconds(),
	});
}

/**
 * Temporal.PlainDateTime을 Date 객체로 변환
 */
export function toJSDate(dateTime: Temporal.PlainDateTime): Date {
	return new Date(
		dateTime.year,
		dateTime.month - 1,
		dateTime.day,
		dateTime.hour,
		dateTime.minute,
		dateTime.second,
		dateTime.millisecond,
	);
}

/**
 * 두 날짜 사이의 일수 차이 계산
 */
export function daysBetween(
	date1: Temporal.PlainDate,
	date2: Temporal.PlainDate,
): number {
	return date1.until(date2).days;
}

/**
 * 오늘 날짜를 Temporal.PlainDate로 반환
 */
export function getToday(): Temporal.PlainDate {
	return Temporal.Now.plainDateISO();
}

/**
 * Temporal.PlainDate를 Date 객체로 변환
 */
export function plainDateToJSDate(date: Temporal.PlainDate): Date {
	return new Date(date.year, date.month - 1, date.day);
}

/**
 * 두 날짜가 같은 날인지 확인
 */
export function isSameDay(
	date1: Temporal.PlainDateTime | Temporal.PlainDate | Date,
	date2: Temporal.PlainDateTime | Temporal.PlainDate | Date,
): boolean {
	const d1 = convertToPlainDate(date1);
	const d2 = convertToPlainDate(date2);
	return Temporal.PlainDate.compare(d1, d2) === 0;
}

/**
 * 두 날짜가 같은 달인지 확인
 */
export function isSameMonth(
	date1: Temporal.PlainDateTime | Temporal.PlainDate | Date,
	date2: Temporal.PlainDateTime | Temporal.PlainDate | Date,
): boolean {
	const d1 = convertToPlainDate(date1);
	const d2 = convertToPlainDate(date2);
	return d1.year === d2.year && d1.month === d2.month;
}

/**
 * 해당 날짜가 오늘인지 확인
 */
export function isToday(
	date: Temporal.PlainDateTime | Temporal.PlainDate | Date,
): boolean {
	return isSameDay(date, getToday());
}

/**
 * 날짜에 개월 수 추가
 */
export function addMonths(date: Date, months: number): Date {
	const temporal = fromJSDate(date);
	const newDate = temporal.toPlainDate().add({ months });
	return plainDateToJSDate(newDate);
}

/**
 * 날짜에서 개월 수 빼기
 */
export function subMonths(date: Date, months: number): Date {
	return addMonths(date, -months);
}

/**
 * 달의 시작일 가져오기
 */
export function startOfMonth(date: Date): Date {
	const temporal = fromJSDate(date);
	const plainDate = temporal.toPlainDate();
	const firstDay = plainDate.with({ day: 1 });
	return plainDateToJSDate(firstDay);
}

/**
 * 달의 마지막일 가져오기
 */
export function endOfMonth(date: Date): Date {
	const temporal = fromJSDate(date);
	const plainDate = temporal.toPlainDate();
	const lastDay = plainDate.with({ day: plainDate.daysInMonth });
	return plainDateToJSDate(lastDay);
}

/**
 * 주의 시작일 가져오기 (일요일 시작 = 0, 월요일 시작 = 1)
 */
export function startOfWeek(
	date: Date,
	options?: { weekStartsOn?: number },
): Date {
	const temporal = fromJSDate(date);
	const plainDate = temporal.toPlainDate();
	const dayOfWeek = plainDate.dayOfWeek; // 1 (월요일) ~ 7 (일요일)
	const weekStartsOn = options?.weekStartsOn ?? 0; // 기본값: 일요일

	// dayOfWeek를 0 (일요일) ~ 6 (토요일)로 변환
	const currentDay = dayOfWeek === 7 ? 0 : dayOfWeek;
	const diff = (currentDay - weekStartsOn + 7) % 7;

	const startDate = plainDate.subtract({ days: diff });
	return plainDateToJSDate(startDate);
}

/**
 * 주의 마지막일 가져오기
 */
export function endOfWeek(
	date: Date,
	options?: { weekStartsOn?: number },
): Date {
	const start = startOfWeek(date, options);
	const temporal = fromJSDate(start);
	const endDate = temporal.toPlainDate().add({ days: 6 });
	return plainDateToJSDate(endDate);
}

/**
 * 두 날짜 사이의 모든 날짜 반환
 */
export function eachDayOfInterval(interval: {
	start: Date;
	end: Date;
}): Date[] {
	const startTemporal = fromJSDate(interval.start).toPlainDate();
	const endTemporal = fromJSDate(interval.end).toPlainDate();

	const days: Date[] = [];
	let currentDate = startTemporal;

	while (Temporal.PlainDate.compare(currentDate, endTemporal) <= 0) {
		days.push(plainDateToJSDate(currentDate));
		currentDate = currentDate.add({ days: 1 });
	}

	return days;
}

/**
 * 날짜를 Temporal.PlainDate로 변환하는 헬퍼 함수
 */
function convertToPlainDate(
	date: Temporal.PlainDateTime | Temporal.PlainDate | Date,
): Temporal.PlainDate {
	if (date instanceof Date) {
		return fromJSDate(date).toPlainDate();
	}
	if ("toPlainDate" in date) {
		return date.toPlainDate();
	}
	return date;
}

/**
 * Temporal.PlainDateTime을 지정된 패턴으로 포맷
 * 패턴: yyyy년 MM월 dd일, MM/dd HH:mm, MM/dd (E) HH:mm 등
 */
export function formatTemporalDateTime(
	dateTime: Temporal.PlainDateTime,
	pattern: string,
): string {
	const year = dateTime.year;
	const month = String(dateTime.month).padStart(2, "0");
	const day = String(dateTime.day).padStart(2, "0");
	const hour = String(dateTime.hour).padStart(2, "0");
	const minute = String(dateTime.minute).padStart(2, "0");

	const dayOfWeek = dateTime.toPlainDate().dayOfWeek;
	const weekdayShort = ["일", "월", "화", "수", "목", "금", "토"][
		dayOfWeek === 7 ? 0 : dayOfWeek
	];

	return pattern
		.replace("yyyy", String(year))
		.replace("MM", month)
		.replace("dd", day)
		.replace("HH", hour)
		.replace("mm", minute)
		.replace("(E)", `(${weekdayShort})`)
		.replace("E", weekdayShort);
}

/**
 * Temporal.PlainDate를 지정된 패턴으로 포맷
 */
export function formatTemporalDate(
	date: Temporal.PlainDate,
	pattern: string,
): string {
	const year = date.year;
	const month = String(date.month).padStart(2, "0");
	const day = String(date.day).padStart(2, "0");
	const dayOfWeek = date.dayOfWeek;
	const weekdayShort = ["일", "월", "화", "수", "목", "금", "토"][
		dayOfWeek === 7 ? 0 : dayOfWeek
	];

	return pattern
		.replace("yyyy", String(year))
		.replace("MM", month)
		.replace("dd", day)
		.replace("d", String(date.day))
		.replace("(E)", `(${weekdayShort})`)
		.replace("E", weekdayShort);
}

export { Temporal };
