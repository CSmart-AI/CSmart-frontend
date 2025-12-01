import { Clock, Loader2, MessageCircle, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, Card, Typography } from "@/components/ui";
import { mockStudents } from "@/data/mockData";
import type { MessageDTO, StudentDTO } from "@/utils/api";
import { messageApi, studentApi } from "@/utils/api";
import { formatTemporalDateTime, fromJSDate, toJSDate } from "@/utils/temporal";

// 학생 정보와 메시지를 함께 관리하는 타입
interface StudentWithMessages extends StudentDTO {
	messages: MessageDTO[];
}

const ManagementPage = () => {
	const { teacherId: teacherIdParam } = useParams<{ teacherId?: string }>();
	const [searchTerm] = useState("");
	const [sortBy] = useState<"name" | "lastActivity">("lastActivity");
	const [students, setStudents] = useState<StudentWithMessages[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// 학생 목록과 메시지 가져오기
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				// URL에서 teacherId 가져오기 (있으면 선생님, 없으면 관리자)
				const teacherId = teacherIdParam
					? parseInt(teacherIdParam, 10)
					: undefined;

				// 관리 중인 학생들 가져오기 (assignedTeacherId가 있는 학생들)
				const studentsResponse = await studentApi.getAll({
					teacherId,
				});

				const managementStudents =
					studentsResponse.isSuccess && studentsResponse.result
						? studentsResponse.result.filter(
								(student) => student.assignedTeacherId != null,
							)
						: [];

				// 각 학생의 메시지 가져오기
				const studentsWithMessages = await Promise.all(
					managementStudents.map(async (student) => {
						const messagesResponse = await messageApi.getByStudent(
							student.studentId,
							1, // 최근 1개만 가져오기
						);
						const messages =
							messagesResponse.isSuccess && messagesResponse.result
								? messagesResponse.result
								: [];
						return {
							...student,
							messages,
						};
					}),
				);

				// 관리자인 경우에만 목업 데이터 추가 (teacherId가 없으면 관리자)
				let finalStudents = studentsWithMessages;
				if (!teacherId) {
					// 목업 데이터 가져오기 (status가 "management"인 학생들)
					const mockManagementStudents = mockStudents.filter(
						(student) => student.status === "management",
					);

					// 목업 데이터를 StudentWithMessages 형태로 변환
					const mockStudentsWithMessages: StudentWithMessages[] =
						mockManagementStudents.map((mockStudent) => {
							// 목업 메시지를 MessageDTO 형태로 변환
							const messages: MessageDTO[] = mockStudent.kakaoMessages.map(
								(msg) => ({
									messageId: parseInt(msg.id.replace("msg", ""), 10) || 0,
									studentId: parseInt(mockStudent.info.id, 10),
									content: msg.message,
									messageType: "text",
									senderType: msg.sender === "student" ? "STUDENT" : "ADMIN",
									sentAt: toJSDate(msg.timestamp).toISOString(),
									createdAt: toJSDate(msg.timestamp).toISOString(),
								}),
							);

							// StudentDTO 형태로 변환
							// PlainDate를 PlainDateTime으로 변환 (시간을 00:00:00으로 설정)
							const createdAtDateTime =
								mockStudent.info.createdAt.toPlainDateTime({
									hour: 0,
									minute: 0,
									second: 0,
								});
							const updatedAtDateTime =
								mockStudent.info.updatedAt.toPlainDateTime({
									hour: 0,
									minute: 0,
									second: 0,
								});

							const studentDTO: StudentDTO = {
								studentId: parseInt(mockStudent.info.id, 10),
								name: mockStudent.info.name,
								age: mockStudent.info.age,
								previousSchool: mockStudent.info.previousEducation,
								targetUniversity: mockStudent.info.targetUniversity,
								phoneNumber: mockStudent.info.phone,
								registrationStatus: "MANAGEMENT",
								createdAt: toJSDate(createdAtDateTime).toISOString(),
								updatedAt: toJSDate(updatedAtDateTime).toISOString(),
							};

							return {
								...studentDTO,
								messages: messages.sort(
									(a, b) =>
										new Date(b.sentAt || 0).getTime() -
										new Date(a.sentAt || 0).getTime(),
								),
							};
						});

					// API 데이터 뒤에 목업 데이터 추가
					finalStudents = [
						...studentsWithMessages,
						...mockStudentsWithMessages,
					];
				}

				setStudents(finalStudents);
			} catch (error) {
				console.error("데이터 조회 실패:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [teacherIdParam]);

	const filteredStudents = students
		.filter(
			(student) =>
				student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				student.phoneNumber?.includes(searchTerm) ||
				student.targetUniversity
					?.toLowerCase()
					.includes(searchTerm.toLowerCase()),
		)
		.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return (a.name || "").localeCompare(b.name || "");
				case "lastActivity": {
					const lastMessageA = a.messages[0]?.sentAt;
					const lastMessageB = b.messages[0]?.sentAt;
					const timeA = lastMessageA ? new Date(lastMessageA).getTime() : 0;
					const timeB = lastMessageB ? new Date(lastMessageB).getTime() : 0;
					return timeB - timeA;
				}
				default:
					return 0;
			}
		});

	// 마지막 메시지 가져오기
	const getLastMessage = (student: StudentWithMessages) => {
		const lastMessage = student.messages[0];
		return lastMessage?.content || "메시지 없음";
	};

	// 읽지 않은 메시지 수 (현재는 간단히 표시하지 않음)
	const getUnreadCount = (_student: StudentWithMessages) => {
		// TODO: 읽지 않은 메시지 수를 API에서 가져오거나 계산
		return 0;
	};

	// 마지막 활동 시간 가져오기
	const getLastActivity = (student: StudentWithMessages) => {
		const lastMessage = student.messages[0];
		if (lastMessage?.sentAt) {
			return fromJSDate(new Date(lastMessage.sentAt));
		}
		if (student.updatedAt) {
			return fromJSDate(new Date(student.updatedAt));
		}
		if (student.createdAt) {
			return fromJSDate(new Date(student.createdAt));
		}
		return null;
	};

	return (
		<div className="flex min-h-[calc(100vh-var(--header-height))]">
			{/* Main Content Area */}
			<main className="flex-1 bg-gray-50">
				<div className="w-full px-[var(--page-padding-inline)] py-6">
					{/* Page Header */}
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-4">
							<Users className="h-5 w-5 text-[var(--color-primary)]" />
							<Typography variant="h3">학생 관리</Typography>
						</div>
						<Typography variant="body-secondary">
							수강 중인 학생들의 개별 질문 및 학습 진도 관리
						</Typography>
					</div>

					<div className="space-y-6">
						{/* Students Grid */}
						{isLoading ? (
							<div className="flex justify-center items-center py-12">
								<Loader2 className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{filteredStudents.map((student) => {
									const unreadCount = getUnreadCount(student);
									const lastMessage = getLastMessage(student);
									const lastActivity = getLastActivity(student);

									return (
										<Card
											key={student.studentId}
											padding="lg"
											className="hover:border-gray-300 transition-all border border-gray-200"
										>
											<div className="flex justify-between items-start mb-4">
												<div className="flex items-center gap-3">
													<div>
														<Typography variant="h3">
															{student.name || `학생 ${student.studentId}`}
														</Typography>
														{student.age && (
															<Typography
																variant="body-secondary"
																className="text-sm"
															>
																{student.age}세
															</Typography>
														)}
													</div>
												</div>
												{unreadCount > 0 && (
													<Badge variant="danger">{unreadCount}</Badge>
												)}
											</div>

											<div className="space-y-3 mb-4">
												{student.targetUniversity && (
													<div className="flex items-center justify-between">
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															목표대학
														</Typography>
														<Typography variant="small" className="font-medium">
															{student.targetUniversity}
														</Typography>
													</div>
												)}

												{student.previousSchool && (
													<div className="flex items-center justify-between">
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															전적대/학과
														</Typography>
														<Typography variant="small" className="font-medium">
															{student.previousSchool}
														</Typography>
													</div>
												)}

												{lastActivity && (
													<div className="flex items-center justify-between">
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															마지막 활동
														</Typography>
														<div className="flex items-center gap-2">
															<Clock className="h-4 w-4 text-gray-600" />
															<Typography variant="small">
																{formatTemporalDateTime(
																	lastActivity,
																	"MM/dd HH:mm",
																)}
															</Typography>
														</div>
													</div>
												)}
											</div>

											{/* Recent Message Preview */}
											{lastMessage !== "메시지 없음" && (
												<Card
													padding="sm"
													className="bg-white/50 mb-4 border border-gray-200"
												>
													<div className="flex items-center justify-between mb-2">
														<Typography
															variant="small"
															className="font-medium flex items-center"
														>
															<MessageCircle className="h-3 w-3 mr-1" />
															최근 메시지
														</Typography>
														{student.messages[0]?.sentAt && (
															<Typography variant="small" className="text-xs">
																{formatTemporalDateTime(
																	fromJSDate(
																		new Date(student.messages[0].sentAt),
																	),
																	"MM/dd HH:mm",
																)}
															</Typography>
														)}
													</div>
													<Typography
														variant="body-secondary"
														className="line-clamp-2 text-xs"
													>
														{lastMessage}
													</Typography>
												</Card>
											)}

											{/* Action Buttons */}
											<div className="flex gap-2">
												<Link
													to={`/student/${student.studentId}`}
													className="flex-1"
												>
													<Button className="w-full">상세보기</Button>
												</Link>
											</div>
										</Card>
									);
								})}

								{filteredStudents.length === 0 && (
									<div className="col-span-full">
										<Card padding="lg" className="text-center">
											<User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
											<Typography variant="h3" className="mb-2">
												관리 중인 학생이 없습니다
											</Typography>
											<Typography variant="body-secondary">
												{searchTerm
													? "검색 결과가 없습니다."
													: "등록이 완료된 학생들이 여기에 표시됩니다."}
											</Typography>
										</Card>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};

export default ManagementPage;
