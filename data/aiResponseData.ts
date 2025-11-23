import { Temporal } from "@/utils/temporal";
import type { AIResponse, FAQTemplate } from "../types/student";

export const faqTemplates: FAQTemplate[] = [
	{
		id: "faq1",
		category: "수업시간",
		keywords: ["수업시간", "시간표", "언제", "몇시"],
		template:
			"안녕하세요! 수업 시간은 평일 오후 2시~6시, 주말 오전 10시~오후 2시입니다. 개별 상담을 통해 맞춤 시간표를 제공해드리니 언제든 연락주세요! 😊",
		isActive: true,
	},
	{
		id: "faq2",
		category: "수강료",
		keywords: ["수강료", "비용", "얼마", "가격", "돈"],
		template:
			"수강료는 과정별로 다릅니다.\n- 기초반: 월 80만원\n- 종합반: 월 120만원\n- 프리미엄반: 월 150만원\n\n자세한 상담은 전화로 안내해드리겠습니다! 📞",
		isActive: true,
	},
	{
		id: "faq3",
		category: "배치고사",
		keywords: ["배치고사", "시험", "테스트", "평가"],
		template:
			"배치고사는 매월 셋째 주 토요일 오후 2시에 실시됩니다. 수학, 영어, 국어 총 3과목이며 소요시간은 3시간입니다. 시험 후 개별 해설지를 제공해드립니다! 📝",
		isActive: true,
	},
	{
		id: "faq4",
		category: "교재",
		keywords: ["교재", "책", "교재비", "자료"],
		template:
			"교재는 등록 시 무료로 제공해드립니다! 기본 교재 외에 추가 자료가 필요한 경우 개별 안내해드리겠습니다. 온라인 자료실도 이용 가능합니다! 📚",
		isActive: true,
	},
	{
		id: "faq5",
		category: "상담예약",
		keywords: ["상담", "예약", "만나", "방문"],
		template:
			"상담 예약은 언제든 가능합니다! 평일 오전 10시~오후 6시, 주말 오전 10시~오후 2시에 상담 가능하며, 전화 또는 방문 상담 모두 가능합니다. 편한 시간 알려주세요! 🕐",
		isActive: true,
	},
];

export const mockAIResponses: AIResponse[] = [
	// 높은 신뢰도 - 자동 발송됨
	{
		id: "ai1",
		studentId: "1",
		originalMessage: "수업시간이 언제인가요?",
		category: "faq",
		confidence: 0.95,
		suggestedResponse:
			"안녕하세요! 수업 시간은 평일 오후 2시~6시, 주말 오전 10시~오후 2시입니다. 개별 상담을 통해 맞춤 시간표를 제공해드리니 언제든 연락주세요! 😊",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T10:30:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T10:30:05"),
	},
	{
		id: "ai2",
		studentId: "2",
		originalMessage: "수강료가 얼마인가요?",
		category: "faq",
		confidence: 0.92,
		suggestedResponse:
			"수강료는 과정별로 다릅니다.\n- 기초반: 월 80만원\n- 종합반: 월 120만원\n- 프리미엄반: 월 150만원\n\n자세한 상담은 전화로 안내해드리겠습니다! 📞",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T11:15:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T11:15:03"),
	},
	{
		id: "ai3",
		studentId: "4",
		originalMessage: "배치고사는 언제 보나요?",
		category: "faq",
		confidence: 0.88,
		suggestedResponse:
			"배치고사는 매월 셋째 주 토요일 오후 2시에 실시됩니다. 수학, 영어, 국어 총 3과목이며 소요시간은 3시간입니다. 시험 후 개별 해설지를 제공해드립니다! 📝",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T14:20:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T14:20:02"),
	},

	// 중간 신뢰도 - 승인 대기 중
	{
		id: "ai4",
		studentId: "3",
		originalMessage:
			"편입 준비하는데 수학이 너무 어려워요. 기초부터 가르쳐주시나요?",
		category: "consultation",
		confidence: 0.75,
		suggestedResponse:
			"수학 기초가 부족하시군요! 저희는 개별 수준에 맞춰 기초부터 차근차근 가르쳐드립니다. 우선 배치고사를 통해 현재 실력을 파악한 후, 맞춤형 커리큘럼을 제공해드리겠습니다. 언제 상담 받으실 수 있나요?",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T15:45:00"),
	},
	{
		id: "ai5",
		studentId: "5",
		originalMessage:
			"작년에 실패했는데 올해는 꼭 합격하고 싶어요. 어떻게 해야 할까요?",
		category: "consultation",
		confidence: 0.72,
		suggestedResponse:
			"재수강을 결심하신 만큼 이번엔 꼭 성공하실 거예요! 작년 경험을 바탕으로 부족했던 부분을 집중적으로 보완해드리겠습니다. 개별 상담을 통해 구체적인 학습 전략을 세워보시죠. 상담 가능한 시간이 언제인가요?",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T16:20:00"),
	},

	// 낮은 신뢰도 - 수동 검토 필요
	{
		id: "ai6",
		studentId: "1",
		originalMessage: "선생님이 너무 까다로워서 스트레스 받아요.",
		category: "complaint",
		confidence: 0.45,
		suggestedResponse:
			"학습 과정에서 어려움을 겪고 계시는군요. 학생분의 의견을 소중히 생각합니다. 원장님과 직접 상담을 통해 더 나은 학습 환경을 만들어보겠습니다. 언제 시간 되실 때 방문해주시겠어요?",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T17:10:00"),
	},

	// 승인된 응답
	{
		id: "ai7",
		studentId: "2",
		originalMessage: "내일 수업 빠져도 될까요? 갑자기 일이 생겼어요.",
		category: "schedule",
		confidence: 0.68,
		suggestedResponse:
			"네, 괜찮습니다! 미리 연락주셔서 감사해요. 내일 수업 내용은 다음 수업 시간에 별도로 설명해드리거나, 온라인 자료로 제공해드리겠습니다. 다른 일정으로 보강 수업도 가능하니 말씀해주세요!",
		isAutoSent: false,
		status: "approved",
		createdAt: Temporal.PlainDateTime.from("2025-09-13T18:30:00"),
		approvedAt: Temporal.PlainDateTime.from("2025-09-13T18:45:00"),
		approvedBy: "관리자",
	},

	// 거절된 응답
	{
		id: "ai8",
		studentId: "3",
		originalMessage: "환불받고 싶은데 어떻게 해야 하나요?",
		category: "payment",
		confidence: 0.55,
		suggestedResponse:
			"환불 관련 문의는 원장님과 직접 상담이 필요합니다. 환불 사유와 상황을 자세히 듣고 최선의 방법을 찾아보겠습니다.",
		isAutoSent: false,
		status: "rejected",
		createdAt: Temporal.PlainDateTime.from("2025-09-13T14:20:00"),
		approvedAt: Temporal.PlainDateTime.from("2025-09-13T14:35:00"),
		approvedBy: "관리자",
	},

	// 최근 자동 발송
	{
		id: "ai9",
		studentId: "4",
		originalMessage: "교재는 따로 사야 하나요?",
		category: "faq",
		confidence: 0.91,
		suggestedResponse:
			"교재는 등록 시 무료로 제공해드립니다! 기본 교재 외에 추가 자료가 필요한 경우 개별 안내해드리겠습니다. 온라인 자료실도 이용 가능합니다! 📚",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T09:15:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T09:15:01"),
	},

	// 오늘의 새로운 문의들
	{
		id: "ai10",
		studentId: "5",
		originalMessage: "편입 면접 준비도 도와주시나요?",
		category: "consultation",
		confidence: 0.78,
		suggestedResponse:
			"네, 편입 면접 준비도 함께 도와드립니다! 모의면접, 자기소개서 첨삭, 면접 예상 질문 등 체계적으로 준비해드리겠습니다. 면접 전형이 있는 대학을 준비하시는군요. 자세한 상담 받으시겠어요?",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T18:00:00"),
	},
];

// 상담 페이지 특화 AI 응답 (전화상담 예약 중심)
export const consultationAIResponses: AIResponse[] = [
	{
		id: "consult_ai1",
		studentId: "3",
		originalMessage: "전화상담 언제 가능한가요?",
		category: "consultation",
		confidence: 0.92,
		suggestedResponse:
			"전화상담은 평일 오전 10시~오후 6시, 주말 오전 10시~오후 2시에 가능합니다! 편하신 시간을 알려주시면 예약해드리겠습니다. 언제가 좋으실까요? 📞",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T09:20:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T09:20:02"),
	},
	{
		id: "consult_ai2",
		studentId: "4",
		originalMessage: "편입상담 받고 싶은데 어떻게 해야 하나요?",
		category: "consultation",
		confidence: 0.88,
		suggestedResponse:
			"편입상담 신청해주셔서 감사합니다! 📝\n\n상담 절차:\n1. 전화상담 일정 예약\n2. 학습 현황 및 목표 확인\n3. 맞춤 학습 계획 수립\n\n언제 통화 가능하신지 알려주세요!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T11:45:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T11:45:01"),
	},
	{
		id: "consult_ai3",
		studentId: "1",
		originalMessage: "내일 오후 3시에 상담 가능한가요?",
		category: "schedule",
		confidence: 0.75,
		suggestedResponse:
			"내일 오후 3시 상담 예약 가능합니다! 👍\n\n예약 확정을 위해 다음 정보를 미리 준비해주세요:\n- 목표 대학/학과\n- 현재 학습 상황\n- 궁금한 점들\n\n예약 확정해드릴까요?",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T16:30:00"),
	},
	{
		id: "consult_ai4",
		studentId: "2",
		originalMessage: "상담비용이 따로 있나요?",
		category: "faq",
		confidence: 0.94,
		suggestedResponse:
			"편입 상담은 무료로 진행됩니다! 😊\n\n상담 내용:\n- 편입 전략 수립\n- 학습 계획 안내\n- 과정별 커리큘럼 설명\n- 개별 질문 답변\n\n부담 없이 상담 받으세요!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T14:10:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T14:10:01"),
	},
	{
		id: "consult_ai5",
		studentId: "5",
		originalMessage: "재수강 상담도 가능한가요? 작년에 실패해서요.",
		category: "consultation",
		confidence: 0.82,
		suggestedResponse:
			"물론 재수강 상담 가능합니다! 💪\n\n재수강생 특별 혜택:\n- 재수강 할인 적용\n- 개별 맞춤 전략 수립\n- 실패 원인 분석 및 보완\n\n이번엔 꼭 성공하실 수 있도록 도와드리겠습니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-13T19:20:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-13T19:20:03"),
	},
	{
		id: "consult_ai6",
		studentId: "1",
		originalMessage: "주말 상담도 가능한가요? 평일엔 시간이 없어서요.",
		category: "consultation",
		confidence: 0.87,
		suggestedResponse:
			"네, 주말 상담도 가능합니다! 주말은 오전 10시~오후 2시에 상담 가능합니다. 이번 주 토요일이나 일요일 중에 편하신 시간을 알려주시면 예약해드리겠습니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T08:15:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T08:15:01"),
	},
	{
		id: "consult_ai7",
		studentId: "3",
		originalMessage: "이과에서 문과로 편입 가능한가요?",
		category: "consultation",
		confidence: 0.73,
		suggestedResponse:
			"이과에서 문과로의 편입도 가능합니다! 다만 대학별로 요구사항이 다르니 구체적인 상담을 통해 목표 대학과 학과에 맞는 전략을 세워보시는 게 좋겠습니다. 상담 예약해드릴까요?",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T17:20:00"),
	},
	{
		id: "consult_ai8",
		studentId: "2",
		originalMessage: "온라인 상담도 되나요?",
		category: "consultation",
		confidence: 0.91,
		suggestedResponse:
			"네, 온라인 상담도 가능합니다! 화상 상담(Zoom) 또는 전화 상담 중 선택하실 수 있습니다. 편하신 방법을 알려주시면 예약해드리겠습니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T10:30:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T10:30:02"),
	},
	{
		id: "consult_ai9",
		studentId: "4",
		originalMessage: "상담 전에 준비할 게 있나요?",
		category: "faq",
		confidence: 0.89,
		suggestedResponse:
			"상담 전 준비사항 안내드립니다! 📋\n\n• 목표 대학/학과\n• 현재 학점 및 성적\n• 편입 시기 계획\n• 궁금한 점들\n\n준비하시면 더 구체적인 상담이 가능합니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T13:00:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T13:00:01"),
	},
	{
		id: "consult_ai10",
		studentId: "5",
		originalMessage: "상담 시간은 얼마나 걸리나요?",
		category: "faq",
		confidence: 0.85,
		suggestedResponse:
			"일반적으로 상담 시간은 30분~1시간 정도 소요됩니다. 학생분의 상황에 따라 더 길어질 수도 있으니 충분한 시간을 확보해주시면 좋겠습니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T15:45:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T15:45:01"),
	},
	{
		id: "consult_ai11",
		studentId: "1",
		originalMessage: "상담 후 바로 등록해야 하나요?",
		category: "consultation",
		confidence: 0.78,
		suggestedResponse:
			"아니요, 상담 후 바로 등록하실 필요는 없습니다! 충분히 고민하시고 결정하시면 됩니다. 다만 조기 등록 시 할인 혜택이 있으니 참고해주세요.",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T18:10:00"),
	},
	{
		id: "consult_ai12",
		studentId: "3",
		originalMessage: "부모님과 함께 상담 받을 수 있나요?",
		category: "consultation",
		confidence: 0.92,
		suggestedResponse:
			"네, 부모님과 함께 상담 받으실 수 있습니다! 가족 상담도 환영합니다. 함께 오시면 더 자세한 설명이 가능하니 예약 시 함께 오신다고 말씀해주세요!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T12:20:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T12:20:02"),
	},
	{
		id: "consult_ai13",
		studentId: "2",
		originalMessage: "상담 예약 취소하고 싶어요.",
		category: "schedule",
		confidence: 0.88,
		suggestedResponse:
			"상담 예약 취소해드리겠습니다! 다른 날짜로 재예약도 가능하니 원하시는 날짜를 알려주시면 다시 예약해드리겠습니다.",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T11:00:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T11:00:01"),
	},
	{
		id: "consult_ai14",
		studentId: "4",
		originalMessage: "상담 받고 싶은데 급하게 해야 할 일이 생겼어요.",
		category: "schedule",
		confidence: 0.71,
		suggestedResponse:
			"급한 일이 생기셨군요! 상담 일정 변경해드리겠습니다. 편하신 시간으로 다시 예약해드릴 수 있으니 언제 가능하신지 알려주세요!",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T19:00:00"),
	},
	{
		id: "consult_ai15",
		studentId: "5",
		originalMessage: "상담 예약 확인하고 싶어요.",
		category: "faq",
		confidence: 0.93,
		suggestedResponse:
			"상담 예약 확인해드리겠습니다! 예약하신 날짜와 시간을 알려주시면 확인 후 안내해드리겠습니다.",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T09:45:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T09:45:01"),
	},
];

// 등록 페이지 특화 AI 응답 (배치고사 안내 중심)
export const registrationAIResponses: AIResponse[] = [
	{
		id: "reg_ai1",
		studentId: "2",
		originalMessage: "배치고사 언제 보나요?",
		category: "placement_test",
		confidence: 0.96,
		suggestedResponse:
			"배치고사 일정 안내드립니다! 📅\n\n• 일시: 매월 셋째 주 토요일 오후 2시\n• 장소: 학원 강의실\n• 과목: 수학, 영어, 국어 (총 3시간)\n• 준비물: 신분증, 필기구\n\n시험 후 해설지와 개별 피드백을 제공합니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T10:15:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T10:15:02"),
	},
	{
		id: "reg_ai2",
		studentId: "1",
		originalMessage: "배치고사 준비는 어떻게 해야 하나요?",
		category: "placement_test",
		confidence: 0.89,
		suggestedResponse:
			"배치고사 준비 가이드입니다! 📚\n\n준비 방법:\n• 수학: 미적분, 확률통계 기본 개념\n• 영어: 독해, 어법 중심\n• 국어: 비문학 독해 위주\n\n기출문제는 상담 시 제공해드리며, 부담 갖지 마세요!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T13:40:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T13:40:01"),
	},
	{
		id: "reg_ai3",
		studentId: "5",
		originalMessage: "개별 카카오톡 채널은 언제 안내받나요?",
		category: "other",
		confidence: 0.71,
		suggestedResponse:
			"개별 카카오톡 채널은 배치고사 완료 후 안내해드립니다! 📱\n\n채널 기능:\n• 개별 질문 답변\n• 학습 자료 공유\n• 과제 제출\n• 진도 확인\n\n배치고사 일정을 먼저 잡아보시겠어요?",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T15:20:00"),
	},
	{
		id: "reg_ai4",
		studentId: "3",
		originalMessage: "해설지는 언제 받을 수 있나요?",
		category: "placement_test",
		confidence: 0.93,
		suggestedResponse:
			"해설지는 배치고사 당일 시험 종료 후 바로 제공됩니다! ✅\n\n해설지 포함 내용:\n• 정답 및 상세 해설\n• 개별 성적 분석\n• 학습 방향 가이드\n• 추천 커리큘럼\n\n개별 피드백 상담도 예약 가능합니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T12:30:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T12:30:01"),
	},
	{
		id: "reg_ai5",
		studentId: "4",
		originalMessage: "결제는 언제 해야 하나요?",
		category: "payment",
		confidence: 0.68,
		suggestedResponse:
			"결제는 상담 후 등록 의사 확정 시 진행됩니다! 💳\n\n결제 방법:\n• 카드결제 (분할 가능)\n• 계좌이체\n• 현금결제\n\n등록 전 충분히 상담받으시고 결정하세요!",
		isAutoSent: false,
		status: "approved",
		createdAt: Temporal.PlainDateTime.from("2025-09-13T16:45:00"),
		approvedAt: Temporal.PlainDateTime.from("2025-09-13T17:00:00"),
		approvedBy: "관리자",
	},
	{
		id: "reg_ai6",
		studentId: "1",
		originalMessage: "배치고사 결과는 언제 나오나요?",
		category: "placement_test",
		confidence: 0.91,
		suggestedResponse:
			"배치고사 결과는 시험 당일 오후 6시경 개별 카카오톡으로 안내해드립니다! 성적표와 함께 맞춤형 학습 계획도 함께 제공됩니다.",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T14:20:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T14:20:01"),
	},
	{
		id: "reg_ai7",
		studentId: "2",
		originalMessage: "배치고사 못 보면 어떻게 되나요?",
		category: "placement_test",
		confidence: 0.76,
		suggestedResponse:
			"배치고사를 못 보시면 다음 달 배치고사에 응시하시거나, 상담을 통해 간단한 수준 테스트를 받으실 수 있습니다. 일정 조율이 필요하시면 말씀해주세요!",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T16:00:00"),
	},
	{
		id: "reg_ai8",
		studentId: "5",
		originalMessage: "등록 후 바로 수업 시작하나요?",
		category: "other",
		confidence: 0.84,
		suggestedResponse:
			"등록 후 수업 시작 일정은 배치고사 결과에 따라 개별적으로 안내해드립니다! 보통 등록 후 1주일 내에 시작하며, 개별 커리큘럼에 맞춰 진행됩니다.",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T11:30:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T11:30:02"),
	},
	{
		id: "reg_ai9",
		studentId: "3",
		originalMessage: "배치고사 재응시 가능한가요?",
		category: "placement_test",
		confidence: 0.88,
		suggestedResponse:
			"네, 배치고사 재응시 가능합니다! 다음 달 배치고사에 다시 응시하실 수 있으며, 실력 향상을 확인하는 좋은 기회가 될 것입니다.",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T09:50:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T09:50:01"),
	},
	{
		id: "reg_ai10",
		studentId: "4",
		originalMessage: "등록금 할인 혜택이 있나요?",
		category: "payment",
		confidence: 0.79,
		suggestedResponse:
			"네, 다양한 할인 혜택이 있습니다! 조기 등록 할인, 재수강 할인, 형제 할인 등이 있으니 상담 시 자세히 안내해드리겠습니다!",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T17:30:00"),
	},
	{
		id: "reg_ai11",
		studentId: "1",
		originalMessage: "배치고사 장소는 어디인가요?",
		category: "placement_test",
		confidence: 0.95,
		suggestedResponse:
			"배치고사는 학원 강의실에서 진행됩니다! 정확한 주소와 교통편은 상담 예약 시 안내해드리겠습니다. 지하철 2호선 강남역에서 도보 5분 거리입니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T13:15:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T13:15:01"),
	},
	{
		id: "reg_ai12",
		studentId: "2",
		originalMessage: "등록 전에 시설 구경 가능한가요?",
		category: "other",
		confidence: 0.87,
		suggestedResponse:
			"네, 시설 견학 가능합니다! 상담 예약 시 함께 시설을 둘러보실 수 있습니다. 강의실, 자습실, 자료실 등을 확인하실 수 있어요!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T10:45:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T10:45:02"),
	},
	{
		id: "reg_ai13",
		studentId: "5",
		originalMessage: "배치고사 문제 수준이 어느 정도인가요?",
		category: "placement_test",
		confidence: 0.72,
		suggestedResponse:
			"배치고사는 편입 시험 수준에 맞춰 출제됩니다! 기초부터 응용까지 다양한 난이도로 구성되어 있어 현재 실력을 정확히 파악할 수 있습니다. 부담 갖지 마세요!",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T18:20:00"),
	},
	{
		id: "reg_ai14",
		studentId: "3",
		originalMessage: "등록 후 환불 정책이 있나요?",
		category: "payment",
		confidence: 0.65,
		suggestedResponse:
			"환불 정책은 등록 시 안내해드립니다! 수업 시작 전, 수업 시작 후 등 시기에 따라 다르니 상담 시 자세히 설명해드리겠습니다.",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T19:15:00"),
	},
	{
		id: "reg_ai15",
		studentId: "4",
		originalMessage: "배치고사 예약은 어떻게 하나요?",
		category: "placement_test",
		confidence: 0.92,
		suggestedResponse:
			"배치고사 예약은 상담 예약과 함께 진행됩니다! 상담 예약하시면 배치고사 일정도 함께 안내해드리니 편하신 시간에 상담 예약해주세요!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T12:00:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T12:00:01"),
	},
];

// 관리 페이지 특화 AI 응답 (편입 일정 및 학습 관리 중심)
export const managementAIResponses: AIResponse[] = [
	{
		id: "mgmt_ai1",
		studentId: "1",
		originalMessage: "편입 원서접수 일정이 언제인가요?",
		category: "schedule",
		confidence: 0.91,
		suggestedResponse:
			"2026년 편입 일정 안내드립니다! 📋\n\n주요 일정:\n• 원서접수: 2025년 12월 중\n• 1차 시험: 2026년 1월\n• 면접: 2026년 2월\n• 합격발표: 2026년 2월 말\n\n대학별 상세 일정은 개별 안내해드리겠습니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T11:20:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T11:20:01"),
	},
	{
		id: "mgmt_ai2",
		studentId: "2",
		originalMessage: "이번 주 과제가 뭔가요?",
		category: "other",
		confidence: 0.76,
		suggestedResponse:
			"이번 주 과제 안내드립니다! 📝\n\n수학: 미적분 연습문제 1-20번\n영어: 독해 지문 3개 + 어법 문제\n국어: 비문학 지문 분석 2개\n\n제출 기한: 금요일까지\n궁금한 점은 언제든 질문해주세요!",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T14:30:00"),
	},
	{
		id: "mgmt_ai3",
		studentId: "5",
		originalMessage: "모의고사 일정 알려주세요",
		category: "schedule",
		confidence: 0.88,
		suggestedResponse:
			"모의고사 일정 안내드립니다! 📊\n\n• 1차 모의고사: 9월 28일 (토) 오후 2시\n• 2차 모의고사: 10월 26일 (토) 오후 2시\n• 3차 모의고사: 11월 23일 (토) 오후 2시\n\n실전과 동일한 환경에서 진행됩니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T16:15:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T16:15:02"),
	},
	{
		id: "mgmt_ai4",
		studentId: "3",
		originalMessage: "성적이 많이 떨어졌는데 어떻게 해야 할까요?",
		category: "consultation",
		confidence: 0.65,
		suggestedResponse:
			"성적 하락에 대해 걱정이 많으시겠네요. 😔\n\n개별 상담을 통해 정확한 원인을 파악하고 맞춤 솔루션을 제공해드리겠습니다.\n\n가능한 빠른 시일 내에 상담 시간을 잡아보시겠어요?",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T17:45:00"),
	},
	{
		id: "mgmt_ai5",
		studentId: "4",
		originalMessage: "자소서 첨삭도 해주시나요?",
		category: "consultation",
		confidence: 0.84,
		suggestedResponse:
			"네, 자기소개서 첨삭 서비스도 제공합니다! ✍️\n\n첨삭 서비스:\n• 구성 및 내용 점검\n• 맞춤법 및 표현 교정\n• 대학별 특성 반영\n• 개별 피드백 제공\n\n초안 작성 후 언제든 요청해주세요!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-13T20:10:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-13T20:10:02"),
	},
	{
		id: "mgmt_ai6",
		studentId: "1",
		originalMessage: "수업 진도가 너무 빨라요. 따라가기 어려워요.",
		category: "consultation",
		confidence: 0.72,
		suggestedResponse:
			"진도가 빠르게 느껴지시는군요! 개별 보충 수업이나 추가 설명이 필요하시면 언제든 말씀해주세요. 학습 속도에 맞춰 조정해드리겠습니다!",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T15:20:00"),
	},
	{
		id: "mgmt_ai7",
		studentId: "2",
		originalMessage: "과제 제출은 어떻게 하나요?",
		category: "other",
		confidence: 0.89,
		suggestedResponse:
			"과제 제출은 개별 카카오톡 채널로 제출해주시면 됩니다! 사진 촬영 또는 파일 첨부로 제출 가능하며, 제출 후 확인 메시지를 드립니다.",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T10:30:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T10:30:01"),
	},
	{
		id: "mgmt_ai8",
		studentId: "5",
		originalMessage: "면접 준비는 언제부터 시작하나요?",
		category: "schedule",
		confidence: 0.87,
		suggestedResponse:
			"면접 준비는 원서접수 후부터 본격적으로 시작합니다! 다만 미리 준비하시면 더 좋으니, 자기소개서 작성과 함께 면접 예상 질문도 준비해보시는 것을 추천드립니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T13:00:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T13:00:02"),
	},
	{
		id: "mgmt_ai9",
		studentId: "3",
		originalMessage: "자습실 이용 시간이 언제인가요?",
		category: "other",
		confidence: 0.93,
		suggestedResponse:
			"자습실 이용 시간은 평일 오전 9시~오후 9시, 주말 오전 10시~오후 6시입니다! 조용한 환경에서 집중하실 수 있도록 준비되어 있습니다.",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T12:15:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T12:15:01"),
	},
	{
		id: "mgmt_ai10",
		studentId: "4",
		originalMessage: "수업 빠지면 어떻게 되나요?",
		category: "schedule",
		confidence: 0.81,
		suggestedResponse:
			"수업을 빠지시면 보강 수업을 받으실 수 있습니다! 미리 연락주시면 다른 시간대에 보강해드리거나, 온라인 자료로 제공해드릴 수 있습니다.",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T18:00:00"),
	},
	{
		id: "mgmt_ai11",
		studentId: "1",
		originalMessage: "학습 자료는 어디서 받나요?",
		category: "other",
		confidence: 0.91,
		suggestedResponse:
			"학습 자료는 개별 카카오톡 채널로 제공되며, 온라인 자료실에서도 다운로드 가능합니다! 자료실 접속 방법은 카카오톡으로 안내해드리겠습니다.",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T09:40:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T09:40:01"),
	},
	{
		id: "mgmt_ai12",
		studentId: "2",
		originalMessage: "모의고사 결과는 언제 나오나요?",
		category: "schedule",
		confidence: 0.88,
		suggestedResponse:
			"모의고사 결과는 시험 다음 날 오전에 개별 카카오톡으로 안내해드립니다! 성적 분석표와 함께 개별 피드백도 제공됩니다.",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T14:50:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T14:50:02"),
	},
	{
		id: "mgmt_ai13",
		studentId: "5",
		originalMessage: "수업 시간표 변경 가능한가요?",
		category: "schedule",
		confidence: 0.74,
		suggestedResponse:
			"수업 시간표 변경은 가능합니다! 다만 다른 학생들의 일정과 조율이 필요하니 미리 말씀해주시면 최선을 다해 조정해드리겠습니다!",
		isAutoSent: false,
		status: "pending",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T19:30:00"),
	},
	{
		id: "mgmt_ai14",
		studentId: "3",
		originalMessage: "개별 질문은 언제 해도 되나요?",
		category: "other",
		confidence: 0.92,
		suggestedResponse:
			"네, 개별 질문은 언제든지 카카오톡 채널로 보내주시면 됩니다! 평일 오전 9시~오후 9시 사이에 답변해드리며, 급한 경우 전화로도 문의 가능합니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T11:10:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T11:10:01"),
	},
	{
		id: "mgmt_ai15",
		studentId: "4",
		originalMessage: "학원 휴강일이 언제인가요?",
		category: "schedule",
		confidence: 0.86,
		suggestedResponse:
			"학원 휴강일은 공휴일과 설날/추석 연휴입니다! 구체적인 휴강 일정은 매월 초에 안내해드리며, 휴강일에도 자습실은 이용 가능합니다!",
		isAutoSent: true,
		status: "sent",
		createdAt: Temporal.PlainDateTime.from("2025-09-14T15:40:00"),
		sentAt: Temporal.PlainDateTime.from("2025-09-14T15:40:02"),
	},
];
