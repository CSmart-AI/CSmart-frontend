import { Eye, MessageCircle, RefreshCw, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	type AiResponseDTO,
	aiResponseApi,
	type ChannelType,
	kakaoApi,
	type StudentDTO,
} from "@/utils/api";
import { cn } from "@/utils/cn";
import {
	extractGuidelineReferencesWithPositions,
	type GuidelineReference,
	getGuidelinesByLines,
} from "@/utils/guideline";
import { Badge, Button, Card, Modal, Typography } from "./ui";

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

interface PageSpecificAIManagerProps {
	chats: ChatItem[];
	students: StudentDTO[];
	channelType: ChannelType;
	loading?: boolean;
	onRefresh?: () => void;
	onMessageSent?: () => void;
}

const PageSpecificAIManager = ({
	chats,
	students,
	channelType: _channelType,
	loading = false,
	onRefresh,
	onMessageSent,
}: PageSpecificAIManagerProps) => {
	const [searchTerm, _setSearchTerm] = useState("");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [messageInputs, setMessageInputs] = useState<Record<string, string>>(
		{},
	);
	const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [aiResponses, setAiResponses] = useState<
		Record<number, AiResponseDTO | null>
	>({});
	const [loadingAiResponses, setLoadingAiResponses] = useState<Set<number>>(
		new Set(),
	);
	const [selectedAiResponse, setSelectedAiResponse] =
		useState<AiResponseDTO | null>(null);
	const [guidelineData, setGuidelineData] = useState<
		Map<string, { question: string; answer: string; category: string } | null>
	>(new Map());
	const [loadingGuidelines, setLoadingGuidelines] = useState(false);
	const [guidelineReferences, setGuidelineReferences] = useState<
		GuidelineReference[]
	>([]);
	const [selectedReference, setSelectedReference] = useState<string | null>(
		null,
	);
	const [sourceLinkReferences, setSourceLinkReferences] = useState<
		Array<{ url: string; startIndex: number; endIndex: number; text: string }>
	>([]);
	const [pdfReferences, setPdfReferences] = useState<
		Array<{ startIndex: number; endIndex: number; text: string }>
	>([]);
	const [showPdfViewer, setShowPdfViewer] = useState(false);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);

	// 학생 정보 맵 생성
	const studentMap = useMemo(() => {
		const map = new Map<number, StudentDTO>();
		students.forEach((student) => {
			map.set(student.studentId, student);
		});
		return map;
	}, [students]);

	/**
	 * 각 학생의 대기 중인 AI 응답 가져오기
	 */
	useEffect(() => {
		const loadAiResponses = async () => {
			const studentIds = new Set(chats.map((chat) => chat.studentId));

			for (const studentId of studentIds) {
				// 로딩 시작
				setLoadingAiResponses((prev) => {
					if (prev.has(studentId)) {
						return prev;
					}
					return new Set(prev).add(studentId);
				});

				// 이미 데이터가 있는지 확인
				setAiResponses((prev) => {
					if (prev[studentId] !== undefined) {
						setLoadingAiResponses((current) => {
							const next = new Set(current);
							next.delete(studentId);
							return next;
						});
						return prev;
					}
					return prev;
				});

				try {
					const response = await aiResponseApi.getByStudent(studentId);
					console.log(response);
					if (response.isSuccess && response.result) {
						// PENDING 상태인 가장 최근 응답 찾기
						const pendingResponse = response.result.find(
							(res) => res.status === "PENDING_REVIEW",
						);
						setAiResponses((prev) => ({
							...prev,
							[studentId]: pendingResponse || null,
						}));

						// AI 응답이 있으면 메시지 입력 필드에 자동 채우기
						if (pendingResponse?.recommendedResponse) {
							const chat = chats.find((c) => c.studentId === studentId);
							if (chat) {
								setMessageInputs((prev) => ({
									...prev,
									[chat.id]: pendingResponse.recommendedResponse,
								}));
							}
						}
					}
				} catch (error) {
					console.error(
						`Failed to load AI response for student ${studentId}:`,
						error,
					);
				} finally {
					setLoadingAiResponses((prev) => {
						const next = new Set(prev);
						next.delete(studentId);
						return next;
					});
				}
			}
		};

		loadAiResponses();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chats]);

	const filteredChats = useMemo(
		() =>
			chats.filter((chat) => {
				if (!searchTerm) return true;
				const name = chat.name || "";
				const lastMessage = chat.lastMessage || "";
				return (
					name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
				);
			}),
		[chats, searchTerm],
	);

	const allSelected =
		filteredChats.length > 0 &&
		filteredChats.every((chat) => selectedIds.has(chat.id));
	const someSelected =
		filteredChats.some((chat) => selectedIds.has(chat.id)) && !allSelected;

	/**
	 * 메시지 입력값 업데이트
	 */
	const handleMessageChange = (chatId: string, value: string) => {
		setMessageInputs((prev) => ({ ...prev, [chatId]: value }));
		setErrors((prev) => {
			const next = { ...prev };
			delete next[chatId];
			return next;
		});
	};

	/**
	 * 출처 링크 참조 추출
	 * @param text 원본 텍스트
	 * @returns 출처 링크 참조 배열
	 */
	const extractSourceLinkReferences = (
		text: string,
	): Array<{
		url: string;
		startIndex: number;
		endIndex: number;
		text: string;
	}> => {
		const references: Array<{
			url: string;
			startIndex: number;
			endIndex: number;
			text: string;
		}> = [];

		// (출처: https://...) 패턴 찾기
		const sourceLinkRegex = /\(출처:\s*(https?:\/\/[^)]+)\)/gi;
		const matches = Array.from(text.matchAll(sourceLinkRegex));

		for (const match of matches) {
			if (match.index !== undefined && match[1]) {
				references.push({
					url: match[1],
					startIndex: match.index,
					endIndex: match.index + match[0].length,
					text: match[0],
				});
			}
		}

		// (설명 (https://...)) 패턴 찾기 (중첩된 괄호)
		// 예: (블로그 (https://blog.naver.com/...))
		const nestedLinkRegex = /\(([^(]+)\s*\((https?:\/\/[^)]+)\)\)/gi;
		const nestedMatches = Array.from(text.matchAll(nestedLinkRegex));

		for (const match of nestedMatches) {
			if (match.index !== undefined && match[2]) {
				// 전체 괄호를 하나의 링크로 처리
				references.push({
					url: match[2],
					startIndex: match.index,
					endIndex: match.index + match[0].length,
					text: match[0],
				});
			}
		}

		return references;
	};

	/**
	 * PDF 참조 추출 (.pdf가 포함된 괄호)
	 * 중첩된 괄호도 처리 가능
	 * @param text 원본 텍스트
	 * @returns PDF 참조 배열
	 */
	const extractPdfReferences = (
		text: string,
	): Array<{
		startIndex: number;
		endIndex: number;
		text: string;
	}> => {
		const references: Array<{
			startIndex: number;
			endIndex: number;
			text: string;
		}> = [];

		// .pdf가 포함된 위치 찾기
		const pdfRegex = /\.pdf/gi;
		const pdfMatches = Array.from(text.matchAll(pdfRegex));

		for (const pdfMatch of pdfMatches) {
			if (pdfMatch.index === undefined) continue;

			const pdfIndex = pdfMatch.index;

			// .pdf 앞에서 가장 가까운 여는 괄호 찾기 (중첩된 괄호 고려)
			let openBracketIndex = -1;
			let bracketDepth = 0;

			for (let i = pdfIndex - 1; i >= 0; i--) {
				if (text[i] === ")") {
					bracketDepth++;
				} else if (text[i] === "(") {
					if (bracketDepth === 0) {
						openBracketIndex = i;
						break;
					}
					bracketDepth--;
				}
			}

			// .pdf 뒤에서 가장 가까운 닫는 괄호 찾기 (중첩된 괄호 고려)
			let closeBracketIndex = -1;
			bracketDepth = 0;

			for (let i = pdfIndex + pdfMatch[0].length; i < text.length; i++) {
				if (text[i] === "(") {
					bracketDepth++;
				} else if (text[i] === ")") {
					if (bracketDepth === 0) {
						closeBracketIndex = i;
						break;
					}
					bracketDepth--;
				}
			}

			// 여는 괄호와 닫는 괄호를 모두 찾았으면 참조 추가
			if (openBracketIndex !== -1 && closeBracketIndex !== -1) {
				const bracketText = text.slice(openBracketIndex, closeBracketIndex + 1);
				// 이미 추가된 참조와 겹치지 않는지 확인
				const isDuplicate = references.some(
					(ref) =>
						ref.startIndex === openBracketIndex &&
						ref.endIndex === closeBracketIndex + 1,
				);

				if (!isDuplicate) {
					references.push({
						startIndex: openBracketIndex,
						endIndex: closeBracketIndex + 1,
						text: bracketText,
					});
				}
			}
		}

		return references;
	};

	/**
	 * 중앙대 관련 링크인지 확인
	 * @param url 링크 URL
	 * @param text 링크 텍스트
	 * @returns 중앙대 관련 여부
	 */
	const isChungangRelated = (url: string, text: string): boolean => {
		const lowerUrl = url.toLowerCase();
		const lowerText = text.toLowerCase();
		return (
			lowerUrl.includes("중앙대") ||
			lowerUrl.includes("chungang") ||
			lowerText.includes("중앙대") ||
			lowerText.includes("chungang")
		);
	};

	/**
	 * PDF 참조 클릭 핸들러
	 * @param e 이벤트 객체 (선택적)
	 */
	const handlePdfReferenceClick = (
		e?: React.MouseEvent | React.KeyboardEvent,
	) => {
		if (e) {
			e.preventDefault();
		}
		// public 폴더의 중앙대.pdf 경로, 12페이지 표시
		const pdfPath = "/중앙대.pdf#page=16";
		setPdfUrl(pdfPath);
		setShowPdfViewer(true);
	};

	/**
	 * 출처 링크 클릭 핸들러
	 * @param url 링크 URL
	 * @param text 링크 텍스트
	 * @param e 이벤트 객체
	 */
	const handleSourceLinkClick = (
		url: string,
		text: string,
		e: React.MouseEvent<HTMLAnchorElement>,
	) => {
		// PDF 파일이고 중앙대 관련이면 뷰어로 표시
		if (
			(url.toLowerCase().endsWith(".pdf") ||
				text.toLowerCase().includes(".pdf")) &&
			isChungangRelated(url, text)
		) {
			e.preventDefault();
			// public 폴더의 중앙대.pdf 경로, 12페이지 표시
			const pdfPath = "/중앙대.pdf#page=16";
			setPdfUrl(pdfPath);
			setShowPdfViewer(true);
		}
		// 그 외의 경우는 기본 동작 (새 탭에서 열기)
	};

	/**
	 * GuidelineDB, 출처 링크, PDF 참조 제거 (메시지 전송 전)
	 * 모든 참조는 괄호 전체를 포함해서 제거됨
	 * @param text 원본 텍스트
	 * @returns 참조가 제거된 텍스트
	 */
	const removeAllReferences = (text: string): string => {
		let result = text;

		// 모든 참조 위치 찾기
		const _guidelineReferences =
			extractGuidelineReferencesWithPositions(result);
		const sourceLinkRefs = extractSourceLinkReferences(result);
		const pdfRefs = extractPdfReferences(result);

		// GuidelineDB 참조는 괄호 전체를 찾아서 제거
		const guidelineBrackets: Array<{
			startIndex: number;
			endIndex: number;
		}> = [];

		// GuidelineDB가 포함된 괄호 전체 찾기
		const guidelineDBWithBracketsRegex = /\([^)]*GuidelineDB[^)]*\)/gi;
		const guidelineBracketMatches = Array.from(
			result.matchAll(guidelineDBWithBracketsRegex),
		);

		for (const match of guidelineBracketMatches) {
			if (match.index !== undefined) {
				guidelineBrackets.push({
					startIndex: match.index,
					endIndex: match.index + match[0].length,
				});
			}
		}

		// 모든 참조를 하나의 배열로 합치고 역순으로 정렬 (뒤에서부터 제거하여 인덱스 변경 방지)
		const allRefs: Array<{
			startIndex: number;
			endIndex: number;
		}> = [
			...guidelineBrackets,
			...sourceLinkRefs.map((ref) => ({
				startIndex: ref.startIndex,
				endIndex: ref.endIndex,
			})),
			...pdfRefs.map((ref) => ({
				startIndex: ref.startIndex,
				endIndex: ref.endIndex,
			})),
		].sort((a, b) => b.startIndex - a.startIndex);

		// 각 참조를 제거 (괄호 전체를 포함)
		for (const ref of allRefs) {
			result = result.slice(0, ref.startIndex) + result.slice(ref.endIndex);
		}

		// 빈 괄호 쌍 제거 (참조 제거 후 남은 괄호들)
		result = result.replace(/\(\s*\)/g, "");

		// 연속된 공백 정리
		return result.replace(/\s+/g, " ").trim();
	};

	/**
	 * 개별 메시지 전송
	 */
	const handleSendMessage = async (chat: ChatItem) => {
		const chatId = chat.id;
		const rawMessage = messageInputs[chatId]?.trim();

		if (!rawMessage) {
			setErrors((prev) => ({
				...prev,
				[chatId]: "메시지를 입력해주세요.",
			}));
			return;
		}

		// GuidelineDB 및 출처 링크 참조 제거
		const message = removeAllReferences(rawMessage);

		if (!message.trim()) {
			setErrors((prev) => ({
				...prev,
				[chatId]: "메시지 내용이 없습니다.",
			}));
			return;
		}

		const student = studentMap.get(chat.studentId);
		if (!student || !student.name) {
			console.log(student);
			setErrors((prev) => ({
				...prev,
				[chatId]: "학생 정보가 올바르지 않습니다.",
			}));
			return;
		}

		setSendingIds((prev) => new Set(prev).add(chatId));

		try {
			const response = await kakaoApi.sendMessage({
				recipient: student.name,
				message,
				messageType: "text",
				chatId: chat.chatId,
			});

			if (response.isSuccess) {
				// 메시지 전송 성공 후 approve API 호출 (작동하지 않더라도 호출)
				const aiResponse = aiResponses[chat.studentId];
				if (aiResponse?.responseId) {
					try {
						await aiResponseApi.approve(aiResponse.responseId);
					} catch (error) {
						// approve 실패해도 무시 (사용자에게 에러 표시하지 않음)
						console.warn("Approve API 호출 실패:", error);
					}
				}

				setMessageInputs((prev) => {
					const next = { ...prev };
					delete next[chatId];
					return next;
				});
				setErrors((prev) => {
					const next = { ...prev };
					delete next[chatId];
					return next;
				});
				onMessageSent?.();
			} else {
				setErrors((prev) => ({
					...prev,
					[chatId]: response.message || "메시지 전송에 실패했습니다.",
				}));
			}
		} catch (error) {
			setErrors((prev) => ({
				...prev,
				[chatId]:
					error instanceof Error
						? error.message
						: "메시지 전송 중 오류가 발생했습니다.",
			}));
		} finally {
			setSendingIds((prev) => {
				const next = new Set(prev);
				next.delete(chatId);
				return next;
			});
		}
	};

	/**
	 * 일괄 메시지 전송
	 */
	const handleBulkSend = async () => {
		const selectedChats = filteredChats.filter((chat) =>
			selectedIds.has(chat.id || ""),
		);

		for (const chat of selectedChats) {
			const chatId = chat.id || "";
			const message = messageInputs[chatId]?.trim();

			if (!message) {
				setErrors((prev) => ({
					...prev,
					[chatId]: "메시지를 입력해주세요.",
				}));
				continue;
			}

			await handleSendMessage(chat);
		}
	};

	/**
	 * 선택 토글
	 */
	const handleToggleSelect = (chatId: string) => {
		const newSelected = new Set(selectedIds);
		if (newSelected.has(chatId)) {
			newSelected.delete(chatId);
		} else {
			newSelected.add(chatId);
		}
		setSelectedIds(newSelected);
	};

	/**
	 * 전체 선택/해제
	 */
	const handleSelectAll = () => {
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(filteredChats.map((chat) => chat.id || "")));
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<Typography variant="h2" className="mb-2">
						카카오톡 메시지 관리
					</Typography>
					<Typography variant="body-secondary" className="text-gray-600">
						채팅 목록을 확인하고 메시지를 전송할 수 있습니다
					</Typography>
				</div>
				{onRefresh && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onRefresh}
						disabled={loading}
						className="p-2"
					>
						<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
					</Button>
				)}
			</div>

			{/* Search */}
			{/* <div className="flex items-center gap-4">
				<div className="flex-1 max-w-md">
					<Input
						type="text"
						placeholder="채팅 이름 또는 메시지로 검색..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						icon={<Search className="h-4 w-4" />}
					/>
				</div>
			</div> */}

			{/* Bulk Actions */}
			{selectedIds.size > 0 && (
				<Card
					padding="md"
					className="flex items-center justify-between bg-white border border-gray-200"
				>
					<div className="flex items-center gap-4">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={allSelected}
								ref={(input) => {
									if (input) input.indeterminate = someSelected;
								}}
								onChange={handleSelectAll}
								className="w-4 h-4 rounded border-gray-300 bg-white text-[var(--color-indigo)] focus:ring-2 focus:ring-[var(--color-indigo)]"
							/>
							<Typography variant="small" className="font-medium text-gray-900">
								전체 선택 ({selectedIds.size}/{filteredChats.length})
							</Typography>
						</label>
					</div>
					<Button
						variant="primary"
						size="sm"
						onClick={handleBulkSend}
						className="bg-[var(--color-green)] hover:opacity-90"
					>
						<Send className="h-4 w-4 mr-1" />
						일괄 전송 ({selectedIds.size})
					</Button>
				</Card>
			)}

			{/* Table */}
			<Card
				padding="none"
				className="overflow-x-auto bg-white border border-gray-200"
			>
				<table className="w-full">
					<thead>
						<tr className="border-b border-gray-200 bg-gray-50">
							<th className="px-4 py-3 text-left w-12">
								<input
									type="checkbox"
									checked={allSelected}
									ref={(input) => {
										if (input) input.indeterminate = someSelected;
									}}
									onChange={handleSelectAll}
									className="w-4 h-4 rounded border-gray-300 bg-white text-[var(--color-indigo)] focus:ring-2 focus:ring-[var(--color-indigo)]"
								/>
							</th>
							<th className="px-4 py-3 text-left w-20">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									프로필
								</Typography>
							</th>
							<th className="px-4 py-3 text-left min-w-[100px]">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									이름
								</Typography>
							</th>
							<th className="px-4 py-3 text-left min-w-[300px]">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									마지막 메시지
								</Typography>
							</th>
							<th className="px-4 py-3 text-left min-w-[450px]">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									전송할 메시지
								</Typography>
							</th>
							<th className="px-4 py-3 text-middle w-24">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									상태
								</Typography>
							</th>
							<th className="px-4 py-3 text-middle w-32">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									시간
								</Typography>
							</th>
							<th className="px-4 py-3 text-middle w-32">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									액션
								</Typography>
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredChats.map((chat) => {
							const chatId = chat.id;
							// 이름이 "unknown"이면 "미등록 학생"으로 표시
							const chatName =
								chat.name?.toLowerCase() === "unknown"
									? "미등록 학생"
									: chat.name || "알 수 없음";
							const isSelected = selectedIds.has(chatId);
							const isSending = sendingIds.has(chatId);
							const error = errors[chatId];
							const message = messageInputs[chatId] || "";
							const aiResponse = aiResponses[chat.studentId];
							const isLoadingAiResponse = loadingAiResponses.has(
								chat.studentId,
							);

							return (
								<tr
									key={chatId}
									className={cn(
										"border-b border-gray-200 hover:bg-gray-50 transition-colors",
										isSelected && "bg-[var(--color-indigo)]/5",
									)}
								>
									<td className="px-4 py-3">
										<input
											type="checkbox"
											checked={isSelected}
											onChange={() => handleToggleSelect(chatId)}
											className="w-4 h-4 rounded border-gray-300 bg-white text-[var(--color-indigo)] focus:ring-2 focus:ring-[var(--color-indigo)]"
										/>
									</td>
									<td className="px-4 py-3">
										<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
											<MessageCircle className="h-5 w-5 text-gray-400" />
										</div>
									</td>
									<td className="px-4 py-3">
										<Typography
											variant="small"
											className="font-medium text-gray-900"
										>
											{chatName}
										</Typography>
									</td>
									<td className="px-4 py-3">
										<div className="relative group">
											<Typography
												variant="body-secondary"
												className="text-sm line-clamp-2 max-w-[300px] cursor-pointer"
											>
												{chat.lastMessage || "메시지 없음"}
											</Typography>
											{chat.lastMessage && (
												<div className="absolute left-0 top-full mt-2 z-50 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg max-w-md whitespace-pre-wrap break-words">
													{chat.lastMessage}
													<div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
												</div>
											)}
										</div>
									</td>
									<td className="px-4 py-3">
										<div className="space-y-2 min-w-[450px]">
											{isLoadingAiResponse ? (
												<div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
													AI 응답 로딩 중...
												</div>
											) : (
												<textarea
													value={message}
													onChange={(e) =>
														handleMessageChange(chatId, e.target.value)
													}
													placeholder={
														aiResponse !== null && aiResponse !== undefined
															? "AI 추천 응답이 자동으로 채워졌습니다. 수정 후 전송하세요."
															: "메시지를 입력하세요..."
													}
													disabled={isSending}
													className={cn(
														"w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)] focus:border-transparent transition-all duration-100 resize-none",
														error && "border-[var(--color-red)]",
														aiResponse !== null &&
															aiResponse !== undefined &&
															"bg-blue-50 border-blue-200 placeholder:text-blue-600",
													)}
													rows={2}
												/>
											)}
											{aiResponse !== null &&
												aiResponse !== undefined &&
												!isLoadingAiResponse && (
													<div className="flex items-center gap-2">
														<Typography
															variant="small"
															className="text-xs text-blue-600 flex items-center gap-1"
														>
															<MessageCircle className="h-3 w-3" />
															AI 추천 응답이 있습니다
														</Typography>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setSelectedAiResponse(aiResponse);
																// GuidelineDB 참조 추출 및 로드 (위치 정보 포함)
																const referencesWithPositions =
																	extractGuidelineReferencesWithPositions(
																		aiResponse.recommendedResponse,
																	);
																setGuidelineReferences(referencesWithPositions);

																// PDF 참조 추출 (먼저 추출하여 중복 제거에 사용)
																const pdfRefs = extractPdfReferences(
																	aiResponse.recommendedResponse,
																);
																setPdfReferences(pdfRefs);

																// 출처 링크 참조 추출 (PDF 참조와 겹치지 않는 것만)
																const allSourceLinks =
																	extractSourceLinkReferences(
																		aiResponse.recommendedResponse,
																	);
																// PDF 참조와 겹치지 않는 출처 링크만 필터링
																const sourceLinks = allSourceLinks.filter(
																	(sourceLink) => {
																		// PDF 참조와 겹치는지 확인
																		return !pdfRefs.some(
																			(pdfRef) =>
																				(sourceLink.startIndex >=
																					pdfRef.startIndex &&
																					sourceLink.startIndex <
																						pdfRef.endIndex) ||
																				(sourceLink.endIndex >
																					pdfRef.startIndex &&
																					sourceLink.endIndex <=
																						pdfRef.endIndex) ||
																				(sourceLink.startIndex <=
																					pdfRef.startIndex &&
																					sourceLink.endIndex >=
																						pdfRef.endIndex),
																		);
																	},
																);
																setSourceLinkReferences(sourceLinks);

																const lineNumbers = referencesWithPositions
																	.map((ref) => ref.lineNumber)
																	.filter((line) => line !== ""); // 빈 lineNumber 제외
																console.log("추출된 라인 번호:", lineNumbers);
																if (lineNumbers.length > 0) {
																	setLoadingGuidelines(true);
																	getGuidelinesByLines(lineNumbers).then(
																		(data) => {
																			console.log(
																				"로드된 GuidelineDB 데이터:",
																				data,
																			);
																			setGuidelineData(data);
																			setLoadingGuidelines(false);
																			// 첫 번째 참조 선택
																			if (lineNumbers.length > 0) {
																				setSelectedReference(lineNumbers[0]);
																			}
																		},
																	);
																} else {
																	setGuidelineData(new Map());
																	setSelectedReference(null);
																}
															}}
															className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
														>
															<Eye className="h-3 w-3 mr-1" />
															자세히보기
														</Button>
													</div>
												)}
											{error && (
												<Typography
													variant="small"
													className="text-[var(--color-red)]"
												>
													{error}
												</Typography>
											)}
										</div>
									</td>
									<td className="px-4 py-3">
										<div className="flex flex-col items-center gap-2">
											{chat.unreadCount && chat.unreadCount > 0 ? (
												<Badge variant="danger" className="text-xs shrink-0">
													읽지 않음 ({chat.unreadCount})
												</Badge>
											) : (
												<Badge variant="success" className="text-xs shrink-0">
													읽음
												</Badge>
											)}
											{chat.isReplied && (
												<Badge variant="primary" className="text-xs shrink-0">
													답변함
												</Badge>
											)}
										</div>
									</td>
									<td className="px-4 py-3">
										{chat.lastLogSendAt && (
											<Typography
												variant="small"
												className="text-xs text-gray-600"
											>
												{new Date(chat.lastLogSendAt).toLocaleString("ko-KR", {
													month: "2-digit",
													day: "2-digit",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</Typography>
										)}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-1">
											<Button
												size="sm"
												onClick={() => handleSendMessage(chat)}
												disabled={isSending || !message.trim()}
												className="bg-[var(--color-green)] hover:opacity-90"
											>
												{isSending ? (
													<>
														<MessageCircle className="h-3 w-3 mr-1 animate-spin" />
														전송 중
													</>
												) : (
													<>
														<Send className="h-3 w-3 mr-1" />
														전송
													</>
												)}
											</Button>
										</div>
									</td>
								</tr>
							);
						})}
						{filteredChats.length === 0 && (
							<tr>
								<td colSpan={8} className="px-4 py-16 text-center">
									<div className="flex flex-col items-center justify-center">
										<MessageCircle className="h-16 w-16 text-gray-300 mb-6" />
										<Typography variant="h3" className="mb-2 text-gray-900">
											채팅이 없습니다
										</Typography>
										<Typography
											variant="body-secondary"
											className="text-gray-600 text-center max-w-md"
										>
											{searchTerm
												? "검색 조건을 변경해보세요."
												: "카카오톡 채팅이 없습니다."}
										</Typography>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</Card>

			{/* AI 응답 상세 모달 */}
			<Modal
				isOpen={selectedAiResponse !== null}
				onClose={() => {
					setSelectedAiResponse(null);
					setGuidelineData(new Map());
					setGuidelineReferences([]);
					setSourceLinkReferences([]);
					setPdfReferences([]);
					setSelectedReference(null);
				}}
				title="AI 응답 상세"
				size="xl"
			>
				{selectedAiResponse && (
					<div className="flex gap-6 h-[calc(90vh-120px)]">
						{/* 좌측: 응답 텍스트 */}
						<div className="flex-1 overflow-y-auto">
							<Typography
								variant="small"
								className="font-medium text-gray-700 mb-2"
							>
								전체 응답
							</Typography>
							<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
								{(() => {
									const text = selectedAiResponse.recommendedResponse;
									const allReferences = [
										...guidelineReferences.map((ref) => ({
											type: "guideline" as const,
											startIndex: ref.startIndex,
											endIndex: ref.endIndex,
											text: ref.text,
											lineNumber: ref.lineNumber,
										})),
										...sourceLinkReferences.map((ref) => ({
											type: "sourceLink" as const,
											startIndex: ref.startIndex,
											endIndex: ref.endIndex,
											text: ref.text,
											url: ref.url,
										})),
										...pdfReferences.map((ref) => ({
											type: "pdf" as const,
											startIndex: ref.startIndex,
											endIndex: ref.endIndex,
											text: ref.text,
										})),
									].sort((a, b) => a.startIndex - b.startIndex);

									if (allReferences.length === 0) {
										return (
											<Typography
												variant="body"
												className="text-gray-900 whitespace-pre-wrap leading-relaxed"
											>
												{text}
											</Typography>
										);
									}

									// 참조 위치를 기준으로 텍스트를 분할하고 하이라이트
									const parts: Array<{
										text: string;
										isReference: boolean;
										referenceType?: "guideline" | "sourceLink" | "pdf";
										lineNumber?: string;
										url?: string;
										key: string;
									}> = [];
									let lastIndex = 0;

									for (const ref of allReferences) {
										// 참조 이전 텍스트
										if (ref.startIndex > lastIndex) {
											parts.push({
												text: text.slice(lastIndex, ref.startIndex),
												isReference: false,
												key: `text-${lastIndex}-${ref.startIndex}`,
											});
										}
										// 참조 텍스트
										parts.push({
											text: ref.text,
											isReference: true,
											referenceType: ref.type,
											lineNumber:
												ref.type === "guideline" ? ref.lineNumber : undefined,
											url: ref.type === "sourceLink" ? ref.url : undefined,
											key: `ref-${ref.type}-${ref.startIndex}`,
										});
										lastIndex = ref.endIndex;
									}
									// 마지막 참조 이후 텍스트
									if (lastIndex < text.length) {
										parts.push({
											text: text.slice(lastIndex),
											isReference: false,
											key: `text-${lastIndex}-end`,
										});
									}

									return (
										<Typography
											variant="body"
											className="text-gray-900 whitespace-pre-wrap leading-relaxed"
										>
											{parts.map((part) => {
												if (part.isReference) {
													if (part.referenceType === "guideline") {
														// lineNumber가 있으면 클릭 가능, 없으면 하이라이트만
														if (part.lineNumber) {
															const isSelected =
																selectedReference === part.lineNumber;
															const lineNum = part.lineNumber;
															return (
																<button
																	type="button"
																	key={part.key}
																	onClick={() => {
																		if (lineNum) {
																			setSelectedReference(lineNum);
																		}
																	}}
																	onKeyDown={(e) => {
																		if (
																			(e.key === "Enter" || e.key === " ") &&
																			lineNum
																		) {
																			e.preventDefault();
																			setSelectedReference(lineNum);
																		}
																	}}
																	className={cn(
																		"cursor-pointer px-1 py-0.5 rounded transition-colors inline",
																		isSelected
																			? "bg-blue-500 text-white font-semibold"
																			: "bg-blue-200 text-blue-800 hover:bg-blue-300",
																	)}
																>
																	{part.text}
																</button>
															);
														} else {
															// lineNumber가 없으면 하이라이트만
															return (
																<span
																	key={part.key}
																	className="px-1 py-0.5 rounded bg-blue-200 text-blue-800 inline"
																>
																	{part.text}
																</span>
															);
														}
													} else if (
														part.referenceType === "sourceLink" &&
														part.url
													) {
														return (
															<a
																href={part.url}
																target="_blank"
																rel="noopener noreferrer"
																key={part.key}
																onClick={(e) => {
																	if (part.url) {
																		handleSourceLinkClick(
																			part.url,
																			part.text,
																			e,
																		);
																	}
																}}
																className="cursor-pointer px-1 py-0.5 rounded transition-colors inline bg-green-200 text-green-800 hover:bg-green-300 underline"
															>
																{part.text}
															</a>
														);
													} else if (part.referenceType === "pdf") {
														return (
															// biome-ignore lint/a11y/useSemanticElements: button을 사용하면 여러 줄에서 깨지므로 span 사용
															<span
																key={part.key}
																role="button"
																tabIndex={0}
																onClick={handlePdfReferenceClick}
																onKeyDown={(e) => {
																	if (e.key === "Enter" || e.key === " ") {
																		e.preventDefault();
																		handlePdfReferenceClick(e);
																	}
																}}
																className="text-purple-800 cursor-pointer hover:text-purple-900 hover:underline"
															>
																{part.text}
															</span>
														);
													}
												}
												return <span key={part.key}>{part.text}</span>;
											})}
										</Typography>
									);
								})()}
							</div>
						</div>

						{/* 우측: GuidelineDB 참조 정보 및 출처 링크 */}
						<div className="w-96 flex-shrink-0 overflow-y-auto border-l border-gray-200 pl-6">
							{/* GuidelineDB 참조 */}
							<div className="mb-6">
								<Typography
									variant="small"
									className="font-medium text-gray-700 mb-3"
								>
									GuidelineDB 참조 출처
								</Typography>
								{loadingGuidelines ? (
									<div className="text-center py-4">
										<Typography
											variant="body-secondary"
											className="text-gray-500"
										>
											GuidelineDB 데이터를 불러오는 중...
										</Typography>
									</div>
								) : guidelineData.size === 0 ? (
									<div className="text-center py-8">
										<Typography
											variant="body-secondary"
											className="text-gray-500"
										>
											GuidelineDB 참조가 없습니다.
										</Typography>
									</div>
								) : (
									<div className="space-y-3">
										{Array.from(guidelineData.entries()).map(
											([lineNumber, data]) => {
												const isSelected = selectedReference === lineNumber;
												return (
													<button
														type="button"
														key={lineNumber}
														onClick={() => setSelectedReference(lineNumber)}
														onKeyDown={(e) => {
															if (e.key === "Enter" || e.key === " ") {
																e.preventDefault();
																setSelectedReference(lineNumber);
															}
														}}
														className={cn(
															"w-full text-left rounded-lg p-4 border transition-all cursor-pointer",
															isSelected
																? "bg-blue-100 border-blue-400 shadow-md"
																: "bg-blue-50 border-blue-200 hover:bg-blue-100",
														)}
													>
														<div className="flex items-start justify-between mb-2">
															<Badge
																variant="primary"
																className="text-xs font-semibold"
															>
																{lineNumber}
															</Badge>
															{data?.category && (
																<Badge variant="default" className="text-xs">
																	{data.category}
																</Badge>
															)}
														</div>
														{data ? (
															<div className="space-y-2">
																<div>
																	<Typography
																		variant="small"
																		className="font-medium text-gray-700 mb-1"
																	>
																		질문
																	</Typography>
																	<Typography
																		variant="body-secondary"
																		className="text-sm text-gray-900"
																	>
																		{data.question}
																	</Typography>
																</div>
																<div>
																	<Typography
																		variant="small"
																		className="font-medium text-gray-700 mb-1"
																	>
																		답변
																	</Typography>
																	<Typography
																		variant="body-secondary"
																		className="text-sm text-gray-900 whitespace-pre-wrap"
																	>
																		{data.answer}
																	</Typography>
																</div>
															</div>
														) : (
															<Typography
																variant="body-secondary"
																className="text-sm text-gray-500"
															>
																해당 라인을 찾을 수 없습니다.
															</Typography>
														)}
													</button>
												);
											},
										)}
									</div>
								)}
							</div>

							{/* 출처 링크 */}
							{sourceLinkReferences.length > 0 && (
								<div className="mb-6">
									<Typography
										variant="small"
										className="font-medium text-gray-700 mb-3"
									>
										출처 링크
									</Typography>
									<div className="space-y-2">
										{sourceLinkReferences.map((ref) => (
											<a
												key={`${ref.startIndex}-${ref.endIndex}`}
												href={ref.url}
												target="_blank"
												rel="noopener noreferrer"
												onClick={(e) =>
													handleSourceLinkClick(ref.url, ref.text, e)
												}
												className="block w-full text-left rounded-lg p-3 border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
											>
												<div className="flex items-center gap-2">
													<Badge variant="success" className="text-xs">
														링크
													</Badge>
													<Typography
														variant="body-secondary"
														className="text-sm text-gray-900 break-all"
													>
														{ref.url}
													</Typography>
												</div>
											</a>
										))}
									</div>
								</div>
							)}

							{/* PDF 참조 */}
							{pdfReferences.length > 0 && (
								<div>
									<Typography
										variant="small"
										className="font-medium text-gray-700 mb-3"
									>
										PDF 참조
									</Typography>
									<div className="space-y-2">
										{pdfReferences.map((ref) => (
											<button
												key={`${ref.startIndex}-${ref.endIndex}`}
												type="button"
												onClick={handlePdfReferenceClick}
												className="block w-full text-left rounded-lg p-3 border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
											>
												<div className="flex items-center gap-2">
													<Badge variant="default" className="text-xs">
														PDF
													</Badge>
													<Typography
														variant="body-secondary"
														className="text-sm text-gray-900 break-all"
													>
														{ref.text}
													</Typography>
												</div>
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</Modal>

			{/* PDF 뷰어 모달 */}
			<Modal
				isOpen={showPdfViewer}
				onClose={() => {
					setShowPdfViewer(false);
					setPdfUrl(null);
				}}
				title="중앙대 모집요강 PDF"
				size="xl"
			>
				{pdfUrl && (
					<div className="w-full h-[calc(90vh-120px)]">
						<iframe
							src={pdfUrl}
							className="w-full h-full border-0 rounded-lg"
							title="중앙대 모집요강 PDF"
						/>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default PageSpecificAIManager;
