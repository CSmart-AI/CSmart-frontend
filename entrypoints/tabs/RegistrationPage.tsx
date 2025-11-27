import {
	Award,
	Calculator,
	CheckCircle,
	Clock,
	FileText,
	Loader2,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, Modal, Typography } from "@/components/ui";
import { mockStudents } from "@/data/mockData";
import type { Student } from "@/types/student";
import type { TeacherDTO } from "@/utils/api";
import { teacherApi } from "@/utils/api";
import { formatTemporalDate } from "@/utils/temporal";

// 학생 정보를 저장된 정보 형식으로 변환하는 함수
const getSavedInfo = (student: Student) => {
	const info = student.info;
	const savedInfo = [
		{ label: "이름", value: info.name || "한지강" },
		{ label: "나이", value: String(info.age) },
		{ label: "유형", value: info.type },
		{ label: "출신학교", value: info.previousEducation || "없음" },
		{
			label: "목표대학",
			value:
				`${info.targetUniversity || ""} ${info.targetMajor || ""}`.trim() ||
				"없음",
		},
		{ label: "계열", value: info.track || "없음" },
		{
			label: "성적",
			value: `수학 ${info.mathGrade || "N/A"}등급, 영어 ${
				info.englishGrade || "N/A"
			}등급`,
		},
		{ label: "이전 수강과정", value: info.previousCourse || "없음" },
		{ label: "알바", value: info.hasPartTimeJob ? "있음" : "없음" },
		{
			label: "응시 예정일",
			value: student.placementTest
				? formatTemporalDate(student.placementTest.testDate, "yyyy년 MM월 dd일")
				: "없음",
		},
		{ label: "과외 경험", value: info.hasToeic ? "있음" : "없음" },
		{ label: "연락 가능 시간", value: info.availableCallTime || "없음" },
		{ label: "메시지", value: info.message || "없음" },
		{ label: "유입 경로", value: info.source || "없음" },
	];

	return savedInfo;
};

const RegistrationPage = () => {
	const [students, setStudents] = useState<Student[]>(
		mockStudents.filter((student) => student.status === "registration"),
	);
	const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
		null,
	);
	const [teachers, setTeachers] = useState<TeacherDTO[]>([]);
	const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
	const [isAnalyzingModalOpen, setIsAnalyzingModalOpen] = useState(false);
	const [isResultModalOpen, setIsResultModalOpen] = useState(false);
	const [_selectedTeacherName, setSelectedTeacherName] = useState<string>("");

	const filteredStudents = students;

	// 선생님 목록 가져오기
	useEffect(() => {
		const fetchTeachers = async () => {
			try {
				const response = await teacherApi.getAll();
				if (response.isSuccess && response.result) {
					setTeachers(response.result);
				}
			} catch (error) {
				console.error("선생님 목록 조회 실패:", error);
			}
		};

		fetchTeachers();
	}, []);

	// 개별 채널 안내 버튼 클릭 핸들러
	const handleChannelGuideClick = (studentId: string) => {
		setSelectedStudentId(studentId);
		setIsTeacherModalOpen(true);
	};

	// 선생님 선택 핸들러
	const handleTeacherSelect = (teacherName: string) => {
		setSelectedTeacherName(teacherName);
		setIsTeacherModalOpen(false);
		setIsAnalyzingModalOpen(true);

		// 3초 후 완료 모달 표시
		setTimeout(() => {
			setIsAnalyzingModalOpen(false);
			setIsResultModalOpen(true);
			// 전송된 학생을 목록에서 제거 (실제로는 상태 관리 필요)
		}, 3000);
	};

	return (
		<div className="flex min-h-[calc(100vh-var(--header-height))]">
			{/* Main Content Area */}
			<main className="flex-1 bg-gray-50">
				<div className="w-full px-[var(--page-padding-inline)] py-6">
					{/* Page Header */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<FileText className="h-5 w-5 text-[var(--color-primary)]" />
								<Typography variant="h3">등록 관리</Typography>
							</div>
							<div className="text-right">
								<Typography variant="h2" className="text-[var(--color-green)]">
									{students.length}
								</Typography>
								<Typography variant="small" className="text-gray-600">
									등록 진행 중
								</Typography>
							</div>
						</div>
						<Typography variant="body-secondary">
							배치고사 및 해설지 배급, 개별 카카오톡 채널 안내
						</Typography>
					</div>

					<div className="space-y-6">
						{/* Students List */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{filteredStudents.map((student) => {
								const displayName =
									student.info.name?.toLowerCase() === "unknown"
										? "한지강"
										: student.info.name || "한지강";

								return (
									<Card key={student.info.id} padding="lg">
										<div className="flex justify-between items-start mb-6">
											<div className="flex items-center gap-4">
												<div className="flex items-center">
													<Typography variant="h3">{displayName}</Typography>
													<Typography variant="body-secondary" className="ml-2">
														({student.info.age}세, {student.info.type})
													</Typography>
												</div>
											</div>
										</div>

										<div className="flex flex-col gap-6">
											{/* 배치고사 결과 */}
											{student.placementTest && (
												<Card
													padding="md"
													className="bg-[var(--color-green)]/10 border border-gray-200"
												>
													<div className="flex items-center mb-3">
														<Calculator className="h-5 w-5 text-[var(--color-green)] mr-2" />
														<Typography
															variant="h4"
															className="text-[var(--color-green)]"
														>
															배치고사 결과
														</Typography>
													</div>
													<div className="space-y-2">
														<div className="flex justify-between items-center">
															<Typography
																variant="body-secondary"
																className="text-sm"
															>
																총점:
															</Typography>
															<Typography
																variant="small"
																className="font-medium text-[var(--color-green)]"
															>
																{student.placementTest.totalScore}/300
															</Typography>
														</div>
														<div className="space-y-1">
															<div className="flex justify-between text-xs">
																<span>
																	수학: {student.placementTest.mathScore}
																</span>
																<span>
																	영어: {student.placementTest.englishScore}
																</span>
																<span>
																	국어: {student.placementTest.koreanScore}
																</span>
															</div>
														</div>
														<div className="flex justify-between items-center">
															<Typography
																variant="body-secondary"
																className="text-sm"
															>
																응시일:
															</Typography>
															<Typography variant="small">
																{formatTemporalDate(
																	student.placementTest.testDate,
																	"MM/dd",
																)}
															</Typography>
														</div>
													</div>
												</Card>
											)}

											{/* Progress Status */}
											<Card
												padding="md"
												className="bg-[var(--color-primary)]/10 border border-gray-200"
											>
												<div className="flex items-center mb-3">
													<Award className="h-5 w-5 text-[var(--color-primary)] mr-2" />
													<Typography
														variant="h4"
														className="text-[var(--color-primary)]"
													>
														진행 상황
													</Typography>
												</div>
												<div className="space-y-3">
													<div className="flex items-center justify-between">
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															상담
														</Typography>
														<CheckCircle className="h-4 w-4 text-[var(--color-green)]" />
													</div>
													<div className="flex items-center justify-between">
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															배치고사 안내
														</Typography>
														<CheckCircle className="h-4 w-4 text-[var(--color-green)]" />
													</div>
													<div className="flex items-center justify-between">
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															개별채널
														</Typography>
														<Clock className="h-4 w-4 text-[var(--color-yellow)]" />
													</div>
													<Button
														variant="secondary"
														size="sm"
														className="w-full mt-3"
														onClick={() =>
															handleChannelGuideClick(student.info.id)
														}
													>
														개별 채널 안내
													</Button>
												</div>
											</Card>
										</div>
									</Card>
								);
							})}

							{filteredStudents.length === 0 && (
								<div className="col-span-full">
									<Card padding="lg" className="text-center">
										<FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
										<Typography variant="h3" className="mb-2">
											등록 진행 중인 학생이 없습니다
										</Typography>
										<Typography variant="body-secondary">
											상담이 완료되어 등록 중인 학생들이 여기에 표시됩니다.
										</Typography>
									</Card>
								</div>
							)}
						</div>

						{/* 선생님 선택 모달 */}
						<Modal
							isOpen={isTeacherModalOpen}
							onClose={() => {
								setIsTeacherModalOpen(false);
								setSelectedStudentId(null);
							}}
							title="선생님 선택"
							size="md"
						>
							<div className="space-y-4">
								<Typography variant="body-secondary">
									학생을 전송할 선생님을 선택해주세요.
								</Typography>
								<div className="space-y-2 max-h-[400px] overflow-y-auto">
									{teachers.length === 0 ? (
										<Typography
											variant="body-secondary"
											className="text-center py-4"
										>
											선생님 목록을 불러오는 중...
										</Typography>
									) : (
										teachers.map((teacher) => (
											<Card
												key={teacher.teacherId}
												padding="md"
												className="cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200"
												onClick={() => handleTeacherSelect(teacher.name)}
											>
												<div className="flex items-center gap-3">
													<User className="h-5 w-5 text-[var(--color-primary)]" />
													<div>
														<Typography variant="h4">{teacher.name}</Typography>
														{teacher.email && (
															<Typography
																variant="body-secondary"
																className="text-sm"
															>
																{teacher.email}
															</Typography>
														)}
													</div>
												</div>
											</Card>
										))
									)}
								</div>
							</div>
						</Modal>

						{/* 분석 중 모달 */}
						<Modal
							isOpen={isAnalyzingModalOpen}
							onClose={() => {}}
							title="채팅 분석 중"
							size="md"
						>
							<div className="space-y-6 py-8">
								<div className="flex flex-col items-center justify-center">
									<Loader2 className="h-12 w-12 text-[var(--color-primary)] animate-spin mb-4" />
									<Typography variant="h4" className="text-center">
										지금까지의 채팅을 분석중입니다
									</Typography>
								</div>
							</div>
						</Modal>

						{/* 저장 완료 모달 */}
						<Modal
							isOpen={isResultModalOpen}
							onClose={() => {
								setIsResultModalOpen(false);
								setSelectedStudentId(null);
								setSelectedTeacherName("");
							}}
							title="완료되었습니다"
							size="lg"
						>
							<div className="space-y-4">
								<div className="flex items-center gap-2 text-[var(--color-green)] mb-4">
									<CheckCircle className="h-5 w-5" />
									<Typography variant="h4">
										다음과 같이 저장되었습니다
									</Typography>
								</div>
								<Card
									padding="md"
									className="bg-gray-50 max-h-[500px] overflow-y-auto"
								>
									{selectedStudentId ? (
										<div className="space-y-2">
											{getSavedInfo(
												students.find((s) => s.info.id === selectedStudentId) ||
													mockStudents.find(
														(s) => s.info.id === selectedStudentId,
													) ||
													students[0],
											).map((info) => (
												<div
													key={`${info.label}-${info.value}`}
													className="flex gap-2"
												>
													<Typography
														variant="small"
														className="font-medium text-gray-600 min-w-[120px]"
													>
														{info.label}:
													</Typography>
													<Typography variant="small" className="flex-1">
														{info.value}
													</Typography>
												</div>
											))}
										</div>
									) : (
										<Typography variant="body-secondary">
											학생 정보를 불러올 수 없습니다.
										</Typography>
									)}
								</Card>
								<div className="flex justify-end">
									<Button
										onClick={() => {
											// 해당 학생을 등록 목록에서 제거하고 관리로 이동
											if (selectedStudentId) {
												// students state에서 제거
												setStudents((prev) =>
													prev.filter((s) => s.info.id !== selectedStudentId),
												);
												// mockStudents에서도 상태 변경 (관리 페이지에서 보이도록)
												const studentIndex = mockStudents.findIndex(
													(s) => s.info.id === selectedStudentId,
												);
												if (studentIndex !== -1) {
													mockStudents[studentIndex].status = "management";
												}
											}
											setIsResultModalOpen(false);
											setSelectedStudentId(null);
											setSelectedTeacherName("");
										}}
									>
										확인
									</Button>
								</div>
							</div>
						</Modal>
					</div>
				</div>
			</main>
		</div>
	);
};

export default RegistrationPage;
