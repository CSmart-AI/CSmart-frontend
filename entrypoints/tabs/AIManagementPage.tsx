import { useCallback, useEffect, useState } from "react";
import PageSpecificAIManager from "@/components/PageSpecificAIManager";
import {
	aiApi,
	type ChannelType,
	kakaoApi,
	type StudentDTO,
	studentApi,
} from "@/utils/api";
import { authStorage } from "@/utils/auth";

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
}

const AIManagementPage = () => {
	const [chats, setChats] = useState<ChatItem[]>([]);
	const [students, setStudents] = useState<StudentDTO[]>([]);
	const [loading, setLoading] = useState(false);
	const [channelType, setChannelType] = useState<ChannelType>("ADMIN");

	const loadData = useCallback(async (triggerAI = false) => {
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

			const authState = await authStorage.get();
			const userChannelType: ChannelType =
				authState.role === "admin" ? "ADMIN" : "TEACHER";
			setChannelType(userChannelType);

			// 채팅 목록과 학생 정보를 병렬로 가져오기
			const [chatListResponse, studentsResponse] = await Promise.all([
				kakaoApi.getChatList(),
				studentApi.getAll(),
			]);

			const loadedStudents =
				studentsResponse.isSuccess && studentsResponse.result
					? studentsResponse.result
					: [];
			setStudents(loadedStudents);

			/**
			 * nickname을 student ID로 매핑
			 * @param nickname 카카오톡 nickname
			 * @returns student ID (매칭되지 않으면 0)
			 */
			const getStudentIdByNickname = (nickname: string): number => {
				const nameKey = nickname.toLowerCase().trim();
				const nameToIdMap: Record<string, number> = {
					임경빈: 1,
					이성재: 2,
					한지강: 3,
				};
				return nameToIdMap[nameKey] || 0;
			};

			// 채팅 목록을 ChatItem 형태로 변환
			if (
				chatListResponse.isSuccess &&
				chatListResponse.result?.data?.chatList?.items
			) {
				const chatItems: ChatItem[] =
					chatListResponse.result.data.chatList.items
						.map((item) => {
							const chatId = item.talk_user?.chat_id || "";
							const nickname = item.talk_user?.nickname || "";

							// nickname으로 student ID 찾기
							const studentId = getStudentIdByNickname(nickname);

							// 이름이 "unknown"이면 "미등록 학생"으로 표시
							const displayName =
								nickname?.toLowerCase() === "unknown"
									? "미등록 학생"
									: nickname || "알 수 없음";

							return {
								id: chatId || item.id || "",
								name: displayName,
								studentId: studentId,
								chatId: chatId, // talk_user.chat_id를 그대로 사용
								lastMessage: item.last_message,
								lastLogSendAt: item.last_log_send_at,
								unreadCount: item.unread_count || 0,
								isReplied: item.is_replied || false,
								isRead: item.is_read || false,
							};
						})
						.filter((chat) => chat.chatId) // chatId가 있는 것만 필터링
						.sort((a, b) => {
							const timeA = a.lastLogSendAt || 0;
							const timeB = b.lastLogSendAt || 0;
							return timeB - timeA;
						});

				setChats(chatItems);
			}
		} catch (error) {
			console.error("Failed to load data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData(true); // 처음 페이지 진입 시 AI 응답 생성 트리거
	}, [loadData]);

	// AI 응답이 들어올 때를 대비해 주기적으로 자동 새로고침
	useEffect(() => {
		const interval = setInterval(() => {
			loadData(false); // AI 트리거 없이 데이터만 새로고침
		}, 30000); // 30초마다 새로고침

		return () => clearInterval(interval);
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
						onMessageSent={() => loadData(false)}
					/>
				</div>
			</main>
		</div>
	);
};

export default AIManagementPage;
