import {
	ArrowLeft,
	Clock,
	GraduationCap,
	Loader2,
	MapPin,
	MessageCircle,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Card, Typography } from "@/components/ui";
import { mockStudents } from "@/data/mockData";
import type { Student } from "@/types/student";
import type { MessageDTO, StudentDTO } from "@/utils/api";
import { messageApi, studentApi } from "@/utils/api";
import { formatTemporalDateTime, fromJSDate } from "@/utils/temporal";

// API 데이터와 목업 데이터를 통합한 타입
interface StudentData {
	// API 데이터 (있을 수도 있고 없을 수도 있음)
	apiStudent?: StudentDTO;
	apiMessages?: MessageDTO[];
	// 목업 데이터 (API 데이터가 없을 때 사용)
	mockStudent?: Student;
}

const StudentDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const [studentData, setStudentData] = useState<StudentData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// 학생 정보와 메시지 가져오기
	useEffect(() => {
		const fetchStudentData = async () => {
			if (!id) return;

			setIsLoading(true);
			try {
				const studentId = parseInt(id, 10);

				// API에서 학생 정보 가져오기
				const studentResponse = await studentApi.getById(studentId);

				if (studentResponse.isSuccess && studentResponse.result) {
					// API에서 메시지 가져오기
					const messagesResponse = await messageApi.getByStudent(studentId);

					const messages =
						messagesResponse.isSuccess && messagesResponse.result
							? messagesResponse.result
							: [];

					setStudentData({
						apiStudent: studentResponse.result,
						apiMessages: messages,
					});
				} else {
					// API에서 없으면 목업 데이터 사용
					const mockStudent = mockStudents.find((s) => s.info.id === id);
					if (mockStudent) {
						setStudentData({ mockStudent });
					} else {
						setStudentData(null);
					}
				}
			} catch (error) {
				console.error("학생 정보 조회 실패:", error);
				// 에러 발생 시 목업 데이터 사용
				const mockStudent = mockStudents.find((s) => s.info.id === id);
				if (mockStudent) {
					setStudentData({ mockStudent });
				} else {
					setStudentData(null);
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchStudentData();
	}, [id]);

	// 로딩 중
	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height))]">
				<Loader2 className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
			</div>
		);
	}

	// 학생 데이터가 없음
	if (!studentData) {
		return (
			<Card padding="lg" className="text-center">
				<User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
				<Typography variant="h3" className="mb-2">
					학생을 찾을 수 없습니다
				</Typography>
				<Link
					to="/management"
					className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium"
				>
					관리 페이지로 돌아가기
				</Link>
			</Card>
		);
	}

	// API 데이터가 있으면 API 데이터 사용, 없으면 목업 데이터 사용
	const mockStudent = studentData.mockStudent;
	if (!studentData.apiStudent && !mockStudent) {
		return (
			<Card padding="lg" className="text-center">
				<User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
				<Typography variant="h3" className="mb-2">
					학생을 찾을 수 없습니다
				</Typography>
				<Link
					to="/management"
					className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium"
				>
					관리 페이지로 돌아가기
				</Link>
			</Card>
		);
	}

	// student는 위의 체크에서 확실히 존재함
	const student: Student = studentData.apiStudent
		? {
				info: {
					id: String(studentData.apiStudent.studentId),
					name: studentData.apiStudent.name || "",
					age: studentData.apiStudent.age || 0,
					type: "일반" as const,
					track: "문과" as const,
					phone: studentData.apiStudent.phoneNumber || "",
					previousEducation: studentData.apiStudent.previousSchool || "",
					targetUniversity: studentData.apiStudent.targetUniversity || "",
					targetMajor: "",
					mathGrade: undefined,
					englishGrade: undefined,
					examType: "수능" as const,
					previousCourse: "",
					isRetaking: false,
					isSunungRetaking: false,
					hasToeic: false,
					hasPartTimeJob: false,
					availableCallTime: "",
					message: "",
					source: "기타" as const,
					createdAt: studentData.apiStudent.createdAt
						? fromJSDate(
								new Date(studentData.apiStudent.createdAt),
							).toPlainDate()
						: fromJSDate(new Date()).toPlainDate(),
					updatedAt: studentData.apiStudent.updatedAt
						? fromJSDate(
								new Date(studentData.apiStudent.updatedAt),
							).toPlainDate()
						: fromJSDate(new Date()).toPlainDate(),
				},
				placementTest: undefined,
				payment: undefined,
				kakaoMessages: (studentData.apiMessages || []).map((msg) => ({
					id: String(msg.messageId),
					studentId: String(msg.studentId || ""),
					message: msg.content,
					sender:
						msg.senderType === "STUDENT"
							? ("student" as const)
							: ("admin" as const),
					timestamp: msg.sentAt
						? fromJSDate(new Date(msg.sentAt))
						: fromJSDate(new Date()),
					isRead: true,
				})),
				status: (studentData.apiStudent.registrationStatus?.toLowerCase() ||
					"management") as "consultation" | "registration" | "management",
				lastActivity: studentData.apiMessages?.[0]?.sentAt
					? fromJSDate(new Date(studentData.apiMessages[0].sentAt))
					: fromJSDate(new Date()),
				specialNotes: "",
			}
		: (mockStudent as Student);

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
										to="/management"
										className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
									>
										<ArrowLeft className="h-5 w-5 text-gray-600" />
									</Link>
									<div>
										<Typography variant="h2">{student.info.name}</Typography>
										<Typography variant="body-secondary">
											{student.info.age}세 · {student.info.type} ·{" "}
											{student.info.track}
										</Typography>
									</div>
								</div>
							</div>
						</Card>
					</div>

					<div className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Student Information */}
							<div className="lg:col-span-2 space-y-6">
								{/* Basic Info */}
								<Card padding="lg">
									<Typography variant="h3" className="mb-4 flex items-center">
										<User className="h-5 w-5 mr-2" />
										기본 정보
									</Typography>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Typography variant="small" className="font-medium mb-1">
												성함
											</Typography>
											<Typography variant="body">
												{student.info.name}
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												나이
											</Typography>
											<Typography variant="body">
												{student.info.age}세
											</Typography>
										</div>
										{student.info.type && (
											<div>
												<Typography
													variant="small"
													className="font-medium mb-1"
												>
													일반/학사
												</Typography>
												<Typography variant="body">
													{student.info.type}
												</Typography>
											</div>
										)}
										{student.info.track && (
											<div>
												<Typography
													variant="small"
													className="font-medium mb-1"
												>
													문과/이과/특성화고/예체능/기타
												</Typography>
												<Typography variant="body">
													{student.info.track}
												</Typography>
											</div>
										)}
										{student.info.availableCallTime && (
											<div>
												<Typography
													variant="small"
													className="font-medium mb-1"
												>
													통화 가능 시간
												</Typography>
												<Typography
													variant="body"
													className="flex items-center"
												>
													<Clock className="h-4 w-4 mr-2" />
													{student.info.availableCallTime}
												</Typography>
											</div>
										)}
										{student.info.source && (
											<div>
												<Typography
													variant="small"
													className="font-medium mb-1"
												>
													유입경로(인스타/블로그)
												</Typography>
												<Typography
													variant="body"
													className="flex items-center"
												>
													<MapPin className="h-4 w-4 mr-2" />
													{student.info.source}
												</Typography>
											</div>
										)}
									</div>
								</Card>

								{/* Academic Info */}
								<Card padding="lg">
									<Typography variant="h3" className="mb-4 flex items-center">
										<GraduationCap className="h-5 w-5 mr-2" />
										학력 정보
									</Typography>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{student.info.previousEducation && (
											<div>
												<Typography
													variant="small"
													className="font-medium mb-1"
												>
													전적대/학과/학점은행제
												</Typography>
												<Typography variant="body">
													{student.info.previousEducation}
												</Typography>
											</div>
										)}
										{student.info.targetUniversity && (
											<div>
												<Typography
													variant="small"
													className="font-medium mb-1"
												>
													목표대학
												</Typography>
												<Typography variant="body">
													{student.info.targetUniversity}
												</Typography>
											</div>
										)}
										{student.info.targetMajor && (
											<div>
												<Typography
													variant="small"
													className="font-medium mb-1"
												>
													목표학과
												</Typography>
												<Typography variant="body">
													{student.info.targetMajor}
												</Typography>
											</div>
										)}
										{student.info.examType && (
											<div>
												<Typography
													variant="small"
													className="font-medium mb-1"
												>
													시험 유형
												</Typography>
												<Typography variant="body">
													{student.info.examType}
												</Typography>
											</div>
										)}
										{student.info.mathGrade && (
											<div>
												<Typography
													variant="small"
													className="font-medium mb-1"
												>
													수학 등급 ({student.info.examType || "수능"})
												</Typography>
												<Typography variant="body">
													{student.info.mathGrade}등급
												</Typography>
											</div>
										)}
										{student.info.englishGrade && (
											<div>
												<Typography
													variant="small"
													className="font-medium mb-1"
												>
													영어 등급 ({student.info.examType || "수능"})
												</Typography>
												<Typography variant="body">
													{student.info.englishGrade}등급
												</Typography>
											</div>
										)}
										{student.info.previousCourse && (
											<div className="md:col-span-2">
												<Typography
													variant="small"
													className="font-medium mb-1"
												>
													수강했던 편입인강 or 학원과 진도
												</Typography>
												<Typography variant="body">
													{student.info.previousCourse}
												</Typography>
											</div>
										)}
										<div className="md:col-span-2">
											<label
												htmlFor="additionalInfo"
												className="text-sm font-medium text-gray-700"
											>
												추가 정보
											</label>
											<div className="flex flex-wrap gap-2 mt-1">
												{student.info.isRetaking && (
													<Badge variant="warning">편입재수</Badge>
												)}
												{student.info.isSunungRetaking && (
													<Badge variant="danger">수능재수</Badge>
												)}
												{student.info.hasToeic && (
													<Badge variant="success">토익 보유</Badge>
												)}
												{student.info.hasPartTimeJob && (
													<Badge variant="primary">알바 중</Badge>
												)}
											</div>
										</div>
									</div>
									{student.info.message && (
										<Card
											padding="md"
											className="mt-4 bg-[var(--color-primary)]/10 border border-gray-200"
										>
											<Typography
												variant="small"
												className="font-medium text-[var(--color-primary)] mb-1"
											>
												꼭 하고 싶은 말
											</Typography>
											<Typography
												variant="body-secondary"
												className="text-[var(--color-primary)]"
											>
												"{student.info.message}"
											</Typography>
										</Card>
									)}
								</Card>
							</div>

							{/* Messages Sidebar */}
							<div className="space-y-6">
								<Card padding="lg">
									<Typography variant="h3" className="mb-4 flex items-center">
										<MessageCircle className="h-5 w-5 mr-2" />
										메시지 이력
									</Typography>
									<div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
										{studentData.apiMessages &&
										studentData.apiMessages.length > 0 ? (
											studentData.apiMessages.map((message) => {
												const isStudent = message.senderType === "STUDENT";
												return (
													<Card
														key={message.messageId}
														padding="md"
														className={`border ${
															isStudent
																? "bg-blue-50 border-blue-300 shadow-sm"
																: "bg-green-50 border-green-300 shadow-sm"
														}`}
													>
														<div className="flex items-start justify-between mb-2">
															{message.sentAt && (
																<Typography
																	variant="small"
																	className={`text-xs ${
																		isStudent
																			? "text-blue-600"
																			: "text-green-600"
																	}`}
																>
																	{formatTemporalDateTime(
																		fromJSDate(new Date(message.sentAt)),
																		"MM/dd HH:mm",
																	)}
																</Typography>
															)}
														</div>
														<Typography
															variant="body"
															className={`text-sm ${
																isStudent ? "text-blue-900" : "text-green-900"
															}`}
														>
															{message.content}
														</Typography>
													</Card>
												);
											})
										) : (
											<Card padding="md" className="text-center">
												<Typography variant="body-secondary">
													메시지가 없습니다
												</Typography>
											</Card>
										)}
									</div>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default StudentDetailPage;
