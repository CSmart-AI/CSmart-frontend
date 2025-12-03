import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Card, Typography } from "@/components/ui";
import type { ApiResponse, TeacherDTO } from "@/utils/api";
import { teacherApi } from "@/utils/api";
import { formatTemporalDateTime, fromJSDate } from "@/utils/temporal";
import { browser } from "wxt/browser";

// API 응답 형식에 맞는 메시지 타입
interface TeacherMessageDTO {
	studentId: number;
	createdAt: string;
	teacherId: number;
	recommendedResponse: string;
	generatedAt: string;
	reviewedAt: string | null;
	messageId: number;
	sentAt: string | null;
	originalMessage: string;
	finalResponse: string;
	responseId: number;
	status: string;
}

const TeacherDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const [teacher, setTeacher] = useState<TeacherDTO | null>(null);
	const [messages, setMessages] = useState<TeacherMessageDTO[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// 선생님 정보와 메시지 가져오기
	useEffect(() => {
		const fetchTeacherData = async () => {
			if (!id) return;

			setIsLoading(true);
			try {
				const teacherId = parseInt(id, 10);

				// 선생님 정보 가져오기
				const teacherResponse = await teacherApi.getById(teacherId);
				if (teacherResponse.isSuccess && teacherResponse.result) {
					setTeacher(teacherResponse.result);
				}

				// 선생님의 메시지 가져오기 (직접 API 호출)
				let token: string | null = null;
				try {
					if (typeof browser !== "undefined" && browser?.storage) {
						const result = await browser.storage.local.get("accessToken");
						token = result.accessToken || null;
					}
				} catch {
					// Fallback for non-extension contexts
				}

				if (!token) {
					throw new Error("인증 토큰이 없습니다.");
				}

				const response = await fetch(
					`http://localhost:8080/api/messages/teacher/${teacherId}?limit=20`,
					{
						method: "GET",
						headers: {
							accept: "*/*",
							Authorization: `Bearer ${token}`,
						},
					},
				);

				if (!response.ok) {
					throw new Error(`API Error: ${response.status}`);
				}

				const data: ApiResponse<TeacherMessageDTO[]> = await response.json();
				if (data.isSuccess && data.result) {
					setMessages(data.result);
				}
			} catch (error) {
				console.error("선생님 정보 조회 실패:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTeacherData();
	}, [id]);

	// 로딩 중
	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height))]">
				<Loader2 className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
			</div>
		);
	}

	// 선생님 데이터가 없음
	if (!teacher) {
		return (
			<Card padding="lg" className="text-center">
				<Typography variant="h3" className="mb-2">
					선생님을 찾을 수 없습니다
				</Typography>
				<Link
					to="/teacher-management"
					className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium"
				>
					선생님 관리 페이지로 돌아가기
				</Link>
			</Card>
		);
	}

	return (
		<div className="flex min-h-[calc(100vh-var(--header-height))]">
			{/* Main Content Area */}
			<main className="flex-1 bg-gray-50">
				<div className="w-full px-[var(--page-padding-inline)] py-6">
					{/* Page Header */}
					<div className="mb-6">
						<Card padding="lg">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-4">
									<Link
										to="/teacher-management"
										className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
									>
										<ArrowLeft className="h-5 w-5 text-gray-600" />
									</Link>
									<div>
										<Typography variant="h2">{teacher.name}</Typography>
										<Typography variant="body-secondary">
											{teacher.email}
										</Typography>
									</div>
								</div>
							</div>
						</Card>
					</div>

					<div className="space-y-6">
						{/* Messages List */}
						<Card padding="lg">
							<Typography variant="h3" className="mb-4 flex items-center">
								<MessageCircle className="h-5 w-5 mr-2" />
								답변 이력
							</Typography>
							<div className="space-y-4">
								{messages.length > 0 ? (
									messages.map((message) => (
										<Card
											key={message.messageId}
											padding="lg"
											className="border border-gray-200"
										>
											<div className="space-y-4">
												{/* 메시지 헤더 */}
												<div className="flex items-center justify-between pb-3 border-b border-gray-200">
													<div className="flex items-center gap-3">
														<Typography variant="small" className="font-medium">
															학생 ID: {message.studentId}
														</Typography>
														{message.status && (
															<Badge
																variant={
																	message.status === "SENT"
																		? "success"
																		: "default"
																}
															>
																{message.status}
															</Badge>
														)}
													</div>
													{message.createdAt && (
														<Typography variant="small" className="text-gray-500">
															{formatTemporalDateTime(
																fromJSDate(new Date(message.createdAt)),
																"yyyy-MM-dd HH:mm",
															)}
														</Typography>
													)}
												</div>

												{/* 원본 메시지 */}
												<div>
													<Typography
														variant="small"
														className="font-medium text-gray-600 mb-2"
													>
														학생 질문
													</Typography>
													<Card
														padding="md"
														className="bg-blue-50 border border-blue-200"
													>
														<Typography variant="body" className="text-blue-900">
															{message.originalMessage}
														</Typography>
													</Card>
												</div>

												{/* AI 추천 답변 */}
												<div>
													<Typography
														variant="small"
														className="font-medium text-gray-600 mb-2"
													>
														AI 추천 답변
													</Typography>
													<Card
														padding="md"
														className="bg-gray-50 border border-gray-200"
													>
														<Typography
															variant="body-secondary"
															className="whitespace-pre-wrap"
														>
															{message.recommendedResponse}
														</Typography>
													</Card>
													{message.generatedAt && (
														<Typography
															variant="small"
															className="text-gray-400 mt-1"
														>
															생성 시간:{" "}
															{formatTemporalDateTime(
																fromJSDate(new Date(message.generatedAt)),
																"yyyy-MM-dd HH:mm:ss",
															)}
														</Typography>
													)}
												</div>

												{/* 최종 전송 답변 */}
												<div>
													<Typography
														variant="small"
														className="font-medium text-gray-600 mb-2"
													>
														최종 전송 답변
													</Typography>
													<Card
														padding="md"
														className="bg-green-50 border border-green-200"
													>
														<Typography
															variant="body-secondary"
															className="whitespace-pre-wrap"
														>
															{message.finalResponse}
														</Typography>
													</Card>
													<div className="flex gap-4 mt-1">
														{message.reviewedAt && (
															<Typography
																variant="small"
																className="text-gray-400"
															>
																검토 시간:{" "}
																{formatTemporalDateTime(
																	fromJSDate(new Date(message.reviewedAt)),
																	"yyyy-MM-dd HH:mm:ss",
																)}
															</Typography>
														)}
														{message.sentAt && (
															<Typography
																variant="small"
																className="text-gray-400"
															>
																전송 시간:{" "}
																{formatTemporalDateTime(
																	fromJSDate(new Date(message.sentAt)),
																	"yyyy-MM-dd HH:mm:ss",
																)}
															</Typography>
														)}
													</div>
												</div>
											</div>
										</Card>
									))
								) : (
									<Card padding="md" className="text-center">
										<Typography variant="body-secondary">
											답변 이력이 없습니다
										</Typography>
									</Card>
								)}
							</div>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
};

export default TeacherDetailPage;

