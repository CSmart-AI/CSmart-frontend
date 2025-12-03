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
	// 전송한 메시지 ID 저장 (localStorage 사용)
	const [sentMessageIds, setSentMessageIds] = useState<Set<number>>(() => {
		// localStorage에서 전송한 메시지 ID 목록 불러오기
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem("sentMessageIds");
			if (stored) {
				try {
					const ids = JSON.parse(stored) as number[];
					return new Set(ids);
				} catch {
					return new Set<number>();
				}
			}
		}
		return new Set<number>();
	});

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

				// teacherId가 없는 항목 필터링 및 전송한 메시지 ID 제외
				const validResponses = pendingResponse.result.filter(
					(res) =>
						res.teacherId !== undefined &&
						res.teacherId !== null &&
						!sentMessageIds.has(res.messageId), // 전송한 메시지 ID는 제외
				);

				if (validResponses.length === 0) {
					setChats([]);
					setStudents([]);
					return;
				}

				// 각 studentId로 학생 정보 가져오기
				const studentIds = new Set(validResponses.map((res) => res.studentId));
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
				for (const response of validResponses) {
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
		[sentMessageIds, teacherIdParam],
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
						onMessageSent={(messageId) => {
							// 전송한 메시지 ID 저장
							if (messageId) {
								const newSentIds = new Set(sentMessageIds);
								newSentIds.add(messageId);
								setSentMessageIds(newSentIds);
								// localStorage에 저장
								if (typeof window !== "undefined") {
									localStorage.setItem(
										"sentMessageIds",
										JSON.stringify(Array.from(newSentIds)),
									);
								}
							}
							loadData(false);
						}}
					/>
				</div>
			</main>
		</div>
	);
};

export default AIManagementPage;
