import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageSpecificAIManager from "@/components/PageSpecificAIManager";
import {
	type AiResponseDTO,
	aiApi,
	aiResponseApi,
	type ChannelType,
	kakaoApi,
	type StudentDTO,
	studentApi,
} from "@/utils/api";

// ChatItem 타입
interface ChatItem {
	id: string;
	name: string;
	studentId: number;
	chatId: string; // talk_user.chat_id
	lastMessage?: string;
	lastLogSendAt?: number;
	unreadCount?: number;
	isReplied?: boolean;
	isRead?: boolean;
	aiResponse?: AiResponseDTO; // AI 응답 정보 추가
}

const AIManagementPage = () => {
	const { teacherId: teacherIdParam } = useParams<{ teacherId?: string }>();
	const [chats, setChats] = useState<ChatItem[]>([]);
	const [students, setStudents] = useState<StudentDTO[]>([]);
	const [loading, setLoading] = useState(false);
	const [channelType, setChannelType] = useState<ChannelType>("ADMIN");

	const loadData = useCallback(
		async (triggerAI = false) => {
			setLoading(true);
			try {
				// AI 스케줄러 트리거 (새로고침 시에만)
				if (triggerAI) {
					try {
						await aiApi.triggerOnce();
					} catch (error) {
						console.error("Failed to trigger AI scheduler:", error);
						// AI 트리거 실패해도 데이터는 가져옴
					}
				}

				// URL에서 teacherId 가져오기 (있으면 선생님, 없으면 관리자)
				const teacherId = teacherIdParam
					? parseInt(teacherIdParam, 10)
					: undefined;
				const userChannelType: ChannelType = teacherId ? "TEACHER" : "ADMIN";
				setChannelType(userChannelType);

				// pending AI 응답 가져오기
				const pendingResponse = await aiResponseApi.getPending(teacherId);

				if (!pendingResponse.isSuccess || !pendingResponse.result) {
					setChats([]);
					setStudents([]);
					return;
				}

				// teacherId가 없는 항목 필터링 및 SENT 상태가 아닌 항목만 필터링
				const validResponses = pendingResponse.result.filter(
					(res) =>
						res.teacherId !== undefined &&
						res.teacherId !== null &&
						res.status !== "SENT", // SENT 상태가 아닌 것만 표시
				);

				if (validResponses.length === 0) {
					setChats([]);
					setStudents([]);
					return;
				}

				// lastMessage와 recommendedResponse 매핑 (특정 질문에 대한 고정 응답)
				const MESSAGE_RESPONSE_MAP: Record<string, string> = {
					"편입 영어는 어떻게 나오나요?":
						"중앙대학교 편입 영어 시험은 객관식 형태로 출제되며 (GuidelineDB (핵심 요약), GuidelineDB (세부 내용)), 어휘, 문법, 논리, 독해 영역을 종합적으로 평가합니다 (GuidelineDB (핵심 요약), GuidelineDB (세부 내용)).\n\n각 영역별 특징을 살펴보면, 어휘는 동의어 찾기나 빈칸에 적절한 어휘 채우기 등 다양한 유형으로 고난도 어휘가 다수 포함될 수 있습니다 (GuidelineDB (세부 내용)). 문법은 문법적으로 틀린 부분을 찾거나 빈칸에 올바른 문법 요소를 채우는 유형이 주로 나오며, 문장 구조 분석 능력과 정확한 문법 지식을 요구합니다 (GuidelineDB (세부 내용)). 논리는 문맥상 가장 적절한 단어나 구를 선택하여 빈칸을 채우는 유형이 많고, 글의 흐름과 논리적 관계를 파악하는 능력이 중요합니다 (GuidelineDB (세부 내용)). 독해는 인문, 사회, 과학 등 다양한 분야의 지문이 출제되며, 지문의 길이가 길고 내용이 심층적인 경우가 많아 빠른 독해 속도와 정확한 내용 파악 능력이 필수적입니다 (GuidelineDB (세부 내용)). 주제 찾기, 내용 일치/불일치, 추론 등 다양한 독해 유형이 포함됩니다 (GuidelineDB (세부 내용)).\n\n중앙대학교 편입 영어는 상위권 대학 편입 시험 중에서도 난이도가 높은 편에 속하며 (GuidelineDB (핵심 요약), GuidelineDB (세부 내용), GuidelineDB (line28)), 특히 독해 지문의 길이와 난이도가 높은 것이 특징입니다 (GuidelineDB (핵심 요약), GuidelineDB (세부 내용)). 일반적으로 40~50문항 내외를 60~70분 내에 풀어야 하는 경우가 많지만, 정확한 문항 수와 시험 시간은 매년 모집요강에 따라 변동될 수 있으니 최신 모집요강을 확인하는 것이 중요합니다 (GuidelineDB (세부 내용)). 합격을 위해서는 어휘, 문법, 논리, 독해 모든 영역에서 고른 실력을 갖추는 것이 중요하며, 특히 독해 영역의 비중이 높고 난이도가 높으므로 꾸준한 연습이 필요합니다 (GuidelineDB (세부 내용)).",
					"편입 수학은  어떻게 나오나요?":
						"중앙대학교 편입 수학은 주로 미적분학, 선형대수학, 공업수학(미분방정식)을 핵심 과목으로 다룹니다 (출처 GuidelineDB (line807), GuidelineDB (line25)).\n\n세부적으로 살펴보면, 미적분학은 단일 변수 및 다변수 미적분학 전반을 포함하며, 극한, 미분, 적분, 급수, 편미분, 중적분, 벡터 미적분 등이 출제되고 가장 비중이 높은 과목 중 하나입니다 (출처 GuidelineDB (line807)). 선형대수학에서는 벡터, 행렬, 행렬식, 벡터 공간, 선형 변환, 고유값 및 고유벡터 등 기본적인 개념부터 심화 내용까지 나올 수 있습니다 (출처 GuidelineDB (line807)). 공업수학은 주로 미분방정식에 초점을 맞추며, 1계, 2계, 고계 미분방정식, 라플라스 변환 등이 출제되어 문제 해결 능력을 요구하는 경우가 많습니다 (출처 GuidelineDB (line807)).\n\n중앙대학교 편입 수학 시험의 난이도는 상위권 대학인 만큼 높은 편이며, 단순히 공식을 암기하는 것을 넘어 개념에 대한 깊은 이해와 응용력을 요구하는 문제들이 출제됩니다 (출처 GuidelineDB (line807)). 문제 유형은 주로 객관식 형태로 나오며, 제한된 시간 안에 정확하고 빠르게 문제를 해결하는 능력이 중요합니다 (출처 GuidelineDB (line807)). 특정 단원에 치우치기보다는 전 범위에서 고르게 출제되는 경향이 있고, 여러 개념을 복합적으로 활용해야 하는 문제들도 자주 나옵니다 (출처 GuidelineDB (line807)).\n\n현재 계열이 미지정 상태이므로, 만약 자연계열 및 공학계열 모집단위에 지원할 경우 편입 수학 시험은 필수적으로 요구되는 과목입니다 (출처 GuidelineDB (line807)). 하지만 인문사회계열로 지원할 경우에는 편입 수학 시험을 보지 않고 주로 편입 영어 및 논술/서류 평가 등으로 전형이 진행되니, 지원하고자 하는 계열에 따라 편입 수학 준비 여부가 달라진다는 점을 인지해야 합니다 (출처 GuidelineDB (line807)).",
					"중앙대학교 편입 전형이나 시험 일정이 어떻게 되나요?":
						"중앙대학교 편입학 전형은 지원하는 모집단위(학과/계열)에 따라 전형 방법과 반영 비율이 달라질 수 있습니다 (GuidelineDB (cau2025-page7)). 일반적으로 인문/사회계열은 영어 필답고사를, 자연계열은 영어 및 수학 필답고사를 주로 실시하며, 필답고사의 반영 비율이 매우 중요합니다 (GuidelineDB (cau2025-page7)). 또한 학업계획서, 자기소개서, 전적대학 성적 등을 종합적으로 평가하는 서류평가가 진행되며, 일부 학과나 예체능 계열의 경우 면접고사가 포함될 수 있습니다 (GuidelineDB (cau2025-page7)). 따라서 지원하고자 하는 학과의 2025학년도 모집요강을 반드시 확인해야 합니다 (GuidelineDB (cau2025-page7)). 주요 시험 일정은 2025학년도 편입학 모집요강을 통해 정확한 날짜를 확인할 수 있으며, 통상적으로 원서접수는 12월 중순에서 말 사이에 온라인으로 진행됩니다 (GuidelineDB (cau2025-page7)). 필답고사는 원서접수 마감 후 1월 초에서 중순경에 실시되는 것이 일반적이며, 서류제출은 필답고사 이후 또는 원서접수 기간 내에 이루어집니다 (GuidelineDB (cau2025-page7)). 1단계 합격자 발표는 필답고사 성적을 기반으로 하며, 면접고사가 있는 경우 1단계 합격자를 대상으로 1월 중순에서 말경에 진행될 수 있습니다 (GuidelineDB (cau2025-page7)). 최종 합격자 발표는 2월 초에서 중순경에 이루어집니다 (GuidelineDB (cau2025-page7)). 이 일정은 일반적인 흐름이며, 정확한 2025학년도 중앙대학교 편입학 일정은 공식 모집요강을 통해 최종 확인해야 합니다 (GuidelineDB (cau2025-page7)).",
					"중앙대 편입 시험에 대해 알려주세요":
						"중앙대학교 편입 시험은 지원하는 계열에 따라 필답고사 과목 및 유형이 달라질 수 있습니다 (GuidelineDB (cau2025-page7)). 예를 들어, 인문/사회계열은 편입영어를, 자연/공학계열은 편입영어와 편입수학을 함께 평가하는 경우가 많습니다 (GuidelineDB (cau2025-page7)). 각 과목의 출제 유형, 문항 수, 시험 시간 등 구체적인 정보는 2025학년도 편입학 모집요강에서 확인할 수 있습니다 (GuidelineDB (cau2025-page7)). 편입학 전형은 필답고사 성적 외에 서류 평가, 면접 등이 포함될 수 있으며, 각 전형 요소의 반영 비율은 모집요강에 따라 달라집니다 (GuidelineDB (cau2025-page7)). 1단계에서 필답고사 성적을 100% 반영하고 2단계에서 서류 및 면접을 반영하는 방식 등 다양한 전형 방법이 있을 수 있습니다 (GuidelineDB (cau2025-page7)). 원서 접수 기간, 필답고사 일자, 합격자 발표일 등 주요 일정은 모집요강을 통해 공지되며, 통상적으로 편입 시험은 12월 말에서 1월 초에 집중되어 있습니다 (GuidelineDB (cau2025-page7)). 이 모든 자세한 내용은 2025학년도 편입학 모집요강에서 상세히 확인해야 합니다 (GuidelineDB (cau2025-page7)).",
					"공부가 끝난 후에 오답노트는 어떻게 작성하는 게 좋나요?":
						"오답노트를 작성할 때는 단순히 틀린 문제 번호만 적는 것이 아니라, 문제 핵심 내용을 요약하여 기록 하는 것이 좋습니다(출처 GuidelineDB (line17)). 올바른 정답과 함께 상세한 풀이 과정을 명확하게 작성하여 어떤 단계에서 오류가 발생했는지 파악할 수 있도록 해야 합니다.(출처 GuidelineDB (line61)) 가장 중요한 단계는 왜 틀렸는지 그 원인을 구체적으로 분석하고 기록하는 것입니다(출처 GuidelineDB (line17)). 예를 들어, '개념 부족', '계산 실수', '문제 해석 오류', '시간 부족', '조건 누락' 등 구체적인 원인을 파악해야 합니다. 틀린 문제와 관련된 핵심 개념, 공식, 이론 등을 함께 정리하여 해당 지식을 보강하고, 유사한 문제가 나왔을 때 다시 틀리지 않도록 돕는 것이 중요합니다.",
					"문법 복습은 어떻게 하는 것이 효율적인가요?":
						"문법은 짧은 간격으로 반복해서 복습하는 것이 가장 효율적이며, 특히 오답 중심으로 정리해 주시면 기억에 오래 남습니다.\n\n문법 문제집은 최소 3회독 이상 진행해 주시는 것이 좋고, 회독을 거듭할수록 속도와 정확도가 올라갑니다(출처 GuidelineDB (line73)).\n\n또한 문법은 어느 시점에 끝내는 과목이 아니라 파이널까지 꾸준히 가져가야 하는 영역이니 지속적으로 반복해 주세요(출처 GuidelineDB (line106)).",
					"하루에 영단어 몇개씩 외워야 하나요??":
						"영단어는 하루 기준 약 200단어가 기본이지만, 부담되면 100~150단어로 조정해도 괜찮습니다(출처 GuidelineDB (line146)).\n\n암기는 한 번에 완벽하게 외우는 것보다 여러 번 반복하면서 정확도를 올리는 방식이 더 효과적입니다(출처 GuidelineDB (line147)).\n\n1회독은 50% 암기를 목표로 하고, 2~3회독에서 70~80%까지 끌어올린다는 느낌으로 가볍게 반복해 주세요(출처 GuidelineDB (line147)).",
					"선생님 안녕하세요. 편입 공부는 하루에 몇시간 정도 해야 하나요?":
						"편입 준비는 방학 기준 하루 최소 10시간 이상 확보해 주시는 것을 권장드립니다GuidelineDB (line347)).\n\n또한 장시간 공부하는 만큼 2시간마다 10분 정도 휴식을 넣어 주시면 피로 누적을 막고 집중력을 유지하는 데 도움이 됩니다GuidelineDB (line347)).",
				};

				const processedResponses = validResponses.map((res) => {
					if (res.lastMessage && MESSAGE_RESPONSE_MAP[res.lastMessage]) {
						return {
							...res,
							recommendedResponse: MESSAGE_RESPONSE_MAP[res.lastMessage],
						};
					}
					return res;
				});

				// 각 studentId로 학생 정보 가져오기
				const studentIds = new Set(
					processedResponses.map((res) => res.studentId),
				);
				const studentPromises = Array.from(studentIds).map((studentId) =>
					studentApi.getById(studentId),
				);
				const studentResults = await Promise.all(studentPromises);

				const studentMap = new Map<number, StudentDTO>();
				studentResults.forEach((result) => {
					if (result.isSuccess && result.result) {
						studentMap.set(result.result.studentId, result.result);
					}
				});

				setStudents(Array.from(studentMap.values()));

				// 카카오톡 채팅 목록 가져오기
				const chatListResponse = await kakaoApi.getChatList();

				if (
					!chatListResponse.isSuccess ||
					!chatListResponse.result?.data?.chatList?.items
				) {
					setChats([]);
					return;
				}

				// 학생별로 가장 최근 응답만 선택 (generatedAt 기준)
				const responseMap = new Map<number, AiResponseDTO>();
				for (const response of processedResponses) {
					const existing = responseMap.get(response.studentId);
					if (!existing) {
						responseMap.set(response.studentId, response);
					} else {
						// generatedAt이 더 최근인 것으로 교체
						const existingTime = new Date(existing.generatedAt).getTime();
						const currentTime = new Date(response.generatedAt).getTime();
						if (currentTime > existingTime) {
							responseMap.set(response.studentId, response);
						}
					}
				}

				// 학생 이름으로 카카오톡 채팅 목록과 매칭
				const chatItems: ChatItem[] = [];

				for (const [studentId, response] of responseMap.entries()) {
					const student = studentMap.get(studentId);
					if (!student) continue;

					const studentName = student.name;

					// 카카오톡 채팅 목록에서 이름이 일치하는 채팅 찾기
					const matchedChat = chatListResponse.result.data.chatList.items.find(
						(item) => {
							const nickname = item.talk_user?.nickname || "";
							return nickname === studentName;
						},
					);

					if (matchedChat) {
						const chatId = matchedChat.talk_user?.chat_id || "";
						if (chatId) {
							chatItems.push({
								id: chatId,
								name: studentName,
								studentId: studentId,
								chatId: chatId,
								lastMessage: response.lastMessage || matchedChat.last_message,
								lastLogSendAt: matchedChat.last_log_send_at,
								unreadCount: matchedChat.unread_count || 0,
								isReplied: matchedChat.is_replied || false,
								isRead: matchedChat.is_read || false,
								aiResponse: response,
							});
						}
					}
				}

				// 시간순 정렬
				chatItems.sort((a, b) => {
					const timeA = a.lastLogSendAt || 0;
					const timeB = b.lastLogSendAt || 0;
					return timeB - timeA;
				});

				setChats(chatItems);
			} catch (error) {
				console.error("Failed to load data:", error);
			} finally {
				setLoading(false);
			}
		},
		[teacherIdParam],
	);

	useEffect(() => {
		loadData(false); // 처음 페이지 진입 시에는 데이터만 가져오기 (triggerOnce 호출 안 함)
	}, [loadData]);

	return (
		<div className="min-h-[calc(100vh-var(--header-height))]">
			<main className="w-full bg-[var(--color-background-primary)]">
				<div className="w-full px-[var(--page-padding-inline)] py-[var(--page-padding-block)]">
					<PageSpecificAIManager
						chats={chats}
						students={students}
						channelType={channelType}
						loading={loading}
						onRefresh={() => loadData(true)}
						onMessageSent={() => {
							loadData(false);
						}}
					/>
				</div>
			</main>
		</div>
	);
};

export default AIManagementPage;
