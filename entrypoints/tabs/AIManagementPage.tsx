import { MessageCircle, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PageSpecificAIManager from "@/components/PageSpecificAIManager";
import { Badge, Button, Input, Typography } from "@/components/ui";
import {
	aiApi,
	type ChannelType,
	kakaoApi,
	type StudentDTO,
	studentApi,
} from "@/utils/api";
import { authStorage } from "@/utils/auth";
import { cn } from "@/utils/cn";

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
	const [searchTerm, setSearchTerm] = useState("");
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

			// 학생을 이름으로 매핑 (nickname과 매칭하기 위해)
			const studentByName = new Map<string, StudentDTO>();
			loadedStudents.forEach((student) => {
				if (student.name) {
					// 대소문자 구분 없이 매칭하기 위해 소문자로 변환
					const nameKey = student.name.toLowerCase().trim();
					studentByName.set(nameKey, student);
				}
			});

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

							// nickname으로 학생 찾기 (대소문자 구분 없이)
							const nameKey = nickname.toLowerCase().trim();
							const student =
								studentByName.get(nameKey) || studentByName.get("unknown"); // "unknown"도 체크

							// 이름이 "unknown"이면 "미등록 학생"으로 표시
							const displayName =
								nickname?.toLowerCase() === "unknown"
									? "미등록 학생"
									: nickname || "알 수 없음";

							return {
								id: chatId || item.id || "",
								name: displayName,
								studentId: student?.studentId || 0,
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

	const filteredChats = chats.filter((chat) => {
		if (!searchTerm) return true;
		const name = chat.name || "";
		const lastMessage = chat.lastMessage || "";
		return (
			name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
		);
	});

	const unreadCount = chats.reduce(
		(sum, chat) => sum + (chat.unreadCount || 0),
		0,
	);

	return (
		<div className="flex min-h-[calc(100vh-var(--header-height))]">
			{/* Sidebar - Chat List */}
			<aside className="w-80 border-r border-gray-200 bg-white flex-shrink-0 flex flex-col">
				{/* Sidebar Header */}
				<div className="p-6 border-b border-gray-200">
					<div className="flex items-center justify-between mb-4">
						<Typography
							variant="h3"
							className="flex items-center gap-2 text-gray-900"
						>
							<MessageCircle className="h-5 w-5 text-[var(--color-indigo)]" />
							카카오톡 채팅
						</Typography>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => loadData(true)}
							disabled={loading}
							className="p-2"
						>
							<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
						</Button>
					</div>
					<Input
						type="text"
						placeholder="채팅 검색..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						icon={<Search className="h-4 w-4" />}
					/>
				</div>

				{/* Chat List */}
				<nav className="flex-1 overflow-y-auto p-2">
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Typography variant="body-secondary">로딩 중...</Typography>
						</div>
					) : filteredChats.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8">
							<MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
							<Typography variant="body-secondary" className="text-center">
								{searchTerm ? "검색 결과가 없습니다" : "채팅이 없습니다"}
							</Typography>
						</div>
					) : (
						<div className="space-y-1">
							{filteredChats.map((chat) => {
								// 이름이 "unknown"이면 "미등록 학생"으로 표시
								const chatName =
									chat.name?.toLowerCase() === "unknown"
										? "미등록 학생"
										: chat.name || "알 수 없음";
								const unread = chat.unreadCount || 0;

								return (
									<div
										key={chat.id}
										className={cn(
											"w-full flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-100 text-left group",
											"hover:bg-gray-50 border border-transparent",
										)}
									>
										<div className="flex-shrink-0">
											<div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
												<MessageCircle className="h-6 w-6 text-gray-400" />
											</div>
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between mb-1">
												<Typography
													variant="small"
													className="font-medium text-gray-900 truncate"
												>
													{chatName}
												</Typography>
												{chat.lastLogSendAt && (
													<Typography
														variant="small"
														className="text-gray-500 text-xs flex-shrink-0 ml-2"
													>
														{new Date(chat.lastLogSendAt).toLocaleTimeString(
															"ko-KR",
															{
																hour: "2-digit",
																minute: "2-digit",
															},
														)}
													</Typography>
												)}
											</div>
											<div className="flex items-center justify-between">
												<Typography
													variant="body-secondary"
													className="text-sm truncate flex-1"
												>
													{chat.lastMessage || "메시지 없음"}
												</Typography>
												{unread > 0 && (
													<Badge
														variant="danger"
														className="h-5 min-w-5 flex items-center justify-center px-1.5 text-[10px] font-semibold ml-2 flex-shrink-0"
													>
														{unread}
													</Badge>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</nav>

				{/* Sidebar Footer */}
				<div className="p-4 border-t border-gray-200">
					<div className="flex items-center justify-between">
						<Typography variant="small" className="text-gray-600">
							총 채팅
						</Typography>
						<Typography variant="small" className="font-semibold text-gray-900">
							{chats.length}
						</Typography>
					</div>
					{unreadCount > 0 && (
						<div className="flex items-center justify-between mt-2">
							<Typography variant="small" className="text-gray-600">
								읽지 않음
							</Typography>
							<Badge variant="danger" className="text-xs">
								{unreadCount}
							</Badge>
						</div>
					)}
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 bg-[var(--color-background-primary)]">
				<div className="w-full px-[var(--page-padding-inline)] py-[var(--page-padding-block)]">
					<PageSpecificAIManager
						chats={chats}
						students={students}
						channelType={channelType}
						onMessageSent={() => loadData(false)}
					/>
				</div>
			</main>
		</div>
	);
};

export default AIManagementPage;
