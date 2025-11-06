import type { Temporal } from "temporal-polyfill";

export interface StudentInfo {
	id: string;
	name: string;
	age: number;
	type: "일반" | "학사";
	previousEducation: string; // 전적대/학과/학점은행제
	targetUniversity: string;
	targetMajor: string;
	track: "문과" | "이과" | "특성화고" | "예체능" | "기타";
	mathGrade?: string; // 수능 수학 등급
	englishGrade?: string; // 수능 영어 등급
	examType: "수능" | "모의고사" | "내신";
	previousCourse: string; // 수강했던 편입인강 or 학원과 진도
	isRetaking: boolean; // 편입재수 여부
	isSunungRetaking: boolean; // 수능재수 여부
	hasToeic: boolean;
	hasPartTimeJob: boolean;
	availableCallTime: string;
	message: string; // 꼭 하고 싶은 말
	source: "인스타" | "블로그" | "기타"; // 유입경로
	phone: string;
	createdAt: Temporal.PlainDate;
	updatedAt: Temporal.PlainDate;
}

export interface PlacementTest {
	id: string;
	studentId: string;
	mathScore?: number;
	englishScore?: number;
	koreanScore?: number;
	totalScore?: number;
	testDate: Temporal.PlainDate;
	explanationProvided: boolean;
}

export interface Payment {
	id: string;
	studentId: string;
	amount: number;
	method: "카드" | "계좌이체" | "현금";
	status: "완료" | "대기" | "취소";
	paymentDate: Temporal.PlainDate;
	course: string;
}

export interface KakaoMessage {
	id: string;
	studentId: string;
	message: string;
	sender: "student" | "admin";
	timestamp: Temporal.PlainDateTime;
	isRead: boolean;
}

export interface Student {
	info: StudentInfo;
	placementTest?: PlacementTest;
	payment?: Payment;
	kakaoMessages: KakaoMessage[];
	status: "consultation" | "registration" | "management";
	lastActivity: Temporal.PlainDateTime;
	specialNotes: string;
}

export type StudentStatus = "consultation" | "registration" | "management";

export interface CalendarEvent {
	id: string;
	title: string;
	description?: string;
	startDate: Temporal.PlainDateTime;
	endDate: Temporal.PlainDateTime;
	type: "consultation" | "placement_test" | "special" | "follow_up";
	studentId?: string;
	studentName?: string;
	status: "scheduled" | "completed" | "cancelled";
	color: string;
}

export interface AIResponse {
	id: string;
	studentId: string;
	originalMessage: string;
	category:
		| "faq"
		| "consultation"
		| "registration"
		| "management"
		| "placement_test"
		| "complaint"
		| "schedule"
		| "payment"
		| "other";
	confidence: number; // 0-1 사이의 신뢰도 점수
	suggestedResponse: string;
	isAutoSent: boolean;
	status: "pending" | "approved" | "sent" | "rejected";
	createdAt: Temporal.PlainDateTime;
	approvedAt?: Temporal.PlainDateTime;
	sentAt?: Temporal.PlainDateTime;
	approvedBy?: string;
}

export interface FAQTemplate {
	id: string;
	category: string;
	keywords: string[];
	template: string;
	isActive: boolean;
}
