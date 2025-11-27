import { Temporal } from "@/utils/temporal";
import type { CalendarEvent } from "../types/student";

// 날짜 포맷팅 헬퍼 함수
const formatDate = (year: number, month: number, day: number, time: string) => {
	return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${time}`;
};

const year = 2025;
const month = 12; // 12월

export const mockCalendarEvents: CalendarEvent[] = [
	// 전화상담 일정
	{
		id: "event1",
		title: "김민수 전화상담",
		description: "연세대 경영학과 편입 상담 - 2차 면담",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 2, "14:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 2, "15:00:00"),
		),
		type: "consultation",
		studentId: "1",
		studentName: "김민수",
		status: "scheduled",
		color: "#3B82F6",
	},
	{
		id: "event2",
		title: "박지영 전화상담",
		description: "이화여대 심리학과 편입 상담",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 4, "11:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 4, "12:00:00"),
		),
		type: "consultation",
		studentId: "2",
		studentName: "박지영",
		status: "scheduled",
		color: "#3B82F6",
	},
	{
		id: "event3",
		title: "이준호 전화상담",
		description: "서울대 컴퓨터공학과 편입 상담",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 6, "19:30:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 6, "20:30:00"),
		),
		type: "consultation",
		studentId: "3",
		studentName: "이준호",
		status: "scheduled",
		color: "#3B82F6",
	},
	{
		id: "event4",
		title: "한소희 전화상담",
		description: "서울대 언론정보학과 편입 상담 - 2차 면담",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 9, "14:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 9, "15:00:00"),
		),
		type: "consultation",
		studentId: "6",
		studentName: "한소희",
		status: "scheduled",
		color: "#3B82F6",
	},
	{
		id: "event5",
		title: "조현우 전화상담",
		description: "POSTECH 컴공 편입 상담 - 학습 전략 수립",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 11, "18:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 11, "19:00:00"),
		),
		type: "consultation",
		studentId: "9",
		studentName: "조현우",
		status: "scheduled",
		color: "#3B82F6",
	},
	{
		id: "event6",
		title: "윤서연 전화상담",
		description: "연세대 사회학과 편입 상담 - 논술 준비 상담",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 13, "13:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 13, "14:00:00"),
		),
		type: "consultation",
		studentId: "8",
		studentName: "윤서연",
		status: "scheduled",
		color: "#3B82F6",
	},
	{
		id: "event7",
		title: "강태현 영어 보완 상담",
		description: "수학 우수 학생 영어 실력 향상 전략 상담",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 16, "14:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 16, "15:00:00"),
		),
		type: "consultation",
		studentId: "7",
		studentName: "강태현",
		status: "scheduled",
		color: "#3B82F6",
	},

	// 배치고사 일정
	{
		id: "event8",
		title: "12월 정기 배치고사",
		description: "신규 등록생 배치고사 실시",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 5, "14:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 5, "17:00:00"),
		),
		type: "placement_test",
		status: "scheduled",
		color: "#10B981",
	},
	{
		id: "event9",
		title: "박지영 보충 배치고사",
		description: "개별 배치고사 (보강)",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 7, "15:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 7, "17:00:00"),
		),
		type: "placement_test",
		studentId: "2",
		studentName: "박지영",
		status: "scheduled",
		color: "#10B981",
	},
	{
		id: "event10",
		title: "정민철 보충 배치고사",
		description: "재수강생 보충 배치고사 실시",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 12, "15:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 12, "17:00:00"),
		),
		type: "placement_test",
		studentId: "5",
		studentName: "정민철",
		status: "scheduled",
		color: "#10B981",
	},

	// 후속 관리 일정
	{
		id: "event11",
		title: "김민수 학습점검",
		description: "월간 학습 진도 점검 및 상담",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 3, "16:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 3, "17:00:00"),
		),
		type: "follow_up",
		studentId: "1",
		studentName: "김민수",
		status: "scheduled",
		color: "#F59E0B",
	},
	{
		id: "event12",
		title: "강태현 학습점검",
		description: "KAIST 목표 학생 월간 학습 진도 점검",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 8, "16:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 8, "17:00:00"),
		),
		type: "follow_up",
		studentId: "7",
		studentName: "강태현",
		status: "scheduled",
		color: "#F59E0B",
	},
	{
		id: "event13",
		title: "윤서연 배치고사 해설",
		description: "배치고사 결과 개별 해설 및 학습 계획 수립",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 10, "15:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 10, "16:30:00"),
		),
		type: "follow_up",
		studentId: "8",
		studentName: "윤서연",
		status: "scheduled",
		color: "#F59E0B",
	},
	{
		id: "event14",
		title: "한소희 학습점검",
		description: "국어 실력 우수 학생 수학 보완 학습 점검",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 14, "16:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 14, "17:00:00"),
		),
		type: "follow_up",
		studentId: "6",
		studentName: "한소희",
		status: "scheduled",
		color: "#F59E0B",
	},
	{
		id: "event15",
		title: "조현우 학습점검",
		description: "POSTECH 목표 학생 주간 학습 진도 점검",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 18, "17:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 18, "18:00:00"),
		),
		type: "follow_up",
		studentId: "9",
		studentName: "조현우",
		status: "scheduled",
		color: "#F59E0B",
	},
	{
		id: "event16",
		title: "정민철 재수강 상담",
		description: "재수강 진도 점검 및 동기부여",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 15, "11:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 15, "12:00:00"),
		),
		type: "follow_up",
		studentId: "5",
		studentName: "정민철",
		status: "scheduled",
		color: "#F59E0B",
	},

	// 특별 일정
	{
		id: "event17",
		title: "학부모 상담회",
		description: "월례 학부모 상담회 및 설명회",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 19, "19:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 19, "21:00:00"),
		),
		type: "special",
		status: "scheduled",
		color: "#8B5CF6",
	},
	{
		id: "event18",
		title: "2026 편입설명회",
		description: "2026년 편입 전략 설명회",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 21, "14:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 21, "16:00:00"),
		),
		type: "special",
		status: "scheduled",
		color: "#8B5CF6",
	},
	{
		id: "event19",
		title: "배치고사 준비 회의",
		description: "배치고사 문제 출제 및 일정 확정 회의",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 23, "14:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 23, "16:00:00"),
		),
		type: "special",
		status: "scheduled",
		color: "#8B5CF6",
	},
	{
		id: "event20",
		title: "학습 자료 업데이트",
		description: "최신 기출문제 및 자료 업데이트",
		startDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 27, "09:00:00"),
		),
		endDate: Temporal.PlainDateTime.from(
			formatDate(year, month, 27, "12:00:00"),
		),
		type: "special",
		status: "scheduled",
		color: "#8B5CF6",
	},
];
