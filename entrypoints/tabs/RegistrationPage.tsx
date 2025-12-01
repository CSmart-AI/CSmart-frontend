import { CheckCircle, FileText, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, Modal, Typography } from "@/components/ui";
import type {
	MessageDTO,
	StudentDTO,
	TeacherDTO,
	TransferToTeacherResponseDTO,
} from "@/utils/api";
import { messageApi, studentApi, teacherApi, transferApi } from "@/utils/api";
import { formatTemporalDateTime, fromJSDate } from "@/utils/temporal";

// 학생별로 그룹화된 메시지 타입
interface StudentMessageGroup {
	studentId: number;
	messages: MessageDTO[];
	studentInfo?: StudentDTO; // 학생 정보 (있는 경우)
}

// 전송된 메시지 ID를 로컬 스토리지에서 가져오는 함수
const getSentMessageIds = (): Set<number> => {
	try {
		if (typeof browser !== "undefined" && browser?.storage) {
			// 비동기로 처리하기 위해 Promise를 반환하지 않고 동기적으로 처리
			// 대신 localStorage를 사용하거나 상태로 관리
		}
		const stored = localStorage.getItem("sentMessageIds");
		if (stored) {
			const ids = JSON.parse(stored) as number[];
			return new Set(ids);
		}
	} catch (error) {
		console.error("전송된 메시지 ID 조회 실패:", error);
	}
	return new Set<number>();
};

// 전송된 메시지 ID를 로컬 스토리지에 저장하는 함수
const saveSentMessageIds = (messageIds: number[]): void => {
	try {
		const existingIds = getSentMessageIds();
		const allIds = new Set([...existingIds, ...messageIds]);
		localStorage.setItem("sentMessageIds", JSON.stringify(Array.from(allIds)));
	} catch (error) {
		console.error("전송된 메시지 ID 저장 실패:", error);
	}
};

// 추출된 정보를 표시용으로 변환하는 함수
const formatExtractedInfo = (
	response: TransferToTeacherResponseDTO,
): Array<{ label: string; value: string }> => {
	const info: Array<{ label: string; value: string }> = [];
	const extracted = response.extractedInfo;

	if (!extracted) {
		return info;
	}

	// additionalInfo에서 특정 필드들을 먼저 확인
	let consultationData: string | undefined;
	let track: string | undefined;

	if (extracted.additionalInfo) {
		if (extracted.additionalInfo.consultationData) {
			consultationData = String(extracted.additionalInfo.consultationData);
		}
		if (extracted.additionalInfo.track) {
			track = String(extracted.additionalInfo.track);
		}
	}

	// consultationData 파싱 함수
	const parseConsultationData = (
		data: string,
	): Array<{ label: string; value: string }> => {
		const parsed: Array<{ label: string; value: string }> = [];

		// ", " 다음에 ":"가 나오는 위치를 찾아서 항목을 분리
		// 예: "전형 유형: 일반, 성적: 수학 1등급(선택과목 기하), 영어 3등급, 학습 이력: ..."
		let currentIndex = 0;

		while (currentIndex < data.length) {
			// 다음 ", " 위치 찾기
			const nextCommaIndex = data.indexOf(", ", currentIndex);

			if (nextCommaIndex === -1) {
				// 마지막 항목
				const lastPart = data.substring(currentIndex);
				const colonIndex = lastPart.indexOf(":");
				if (colonIndex > 0) {
					const label = lastPart.substring(0, colonIndex).trim();
					const value = lastPart.substring(colonIndex + 1).trim();
					if (label && value) {
						parsed.push({ label, value });
					}
				}
				break;
			}

			// ", " 다음 부분 확인
			const afterComma = data.substring(nextCommaIndex + 2);
			const nextColonIndex = afterComma.indexOf(":");

			if (nextColonIndex > 0) {
				// 다음 항목이 있음 - 현재 항목은 ", " 전까지
				const currentPart = data.substring(currentIndex, nextCommaIndex);
				const colonIndex = currentPart.indexOf(":");
				if (colonIndex > 0) {
					const label = currentPart.substring(0, colonIndex).trim();
					const value = currentPart.substring(colonIndex + 1).trim();
					if (label && value) {
						parsed.push({ label, value });
					}
				}
				currentIndex = nextCommaIndex + 2;
			} else {
				// 다음 항목이 없음 - 나머지 모두가 현재 항목의 값
				const currentPart = data.substring(currentIndex);
				const colonIndex = currentPart.indexOf(":");
				if (colonIndex > 0) {
					const label = currentPart.substring(0, colonIndex).trim();
					const value = currentPart.substring(colonIndex + 1).trim();
					if (label && value) {
						parsed.push({ label, value });
					}
				}
				break;
			}
		}

		return parsed;
	};

	// 기본 정보
	if (extracted.name) {
		info.push({ label: "이름", value: extracted.name });
	}
	if (extracted.age) {
		info.push({ label: "나이", value: String(extracted.age) });
	}
	if (track) {
		info.push({ label: "계열", value: track });
	}
	if (extracted.previousSchool) {
		info.push({ label: "출신학교", value: extracted.previousSchool });
	}
	if (extracted.targetUniversity) {
		info.push({ label: "목표대학", value: extracted.targetUniversity });
	}
	if (extracted.major) {
		info.push({ label: "전공", value: extracted.major });
	}
	if (extracted.currentGrade) {
		info.push({ label: "현재 학년", value: extracted.currentGrade });
	}
	if (extracted.desiredSemester) {
		info.push({ label: "희망 입학 학기", value: extracted.desiredSemester });
	}
	if (extracted.phoneNumber) {
		info.push({ label: "전화번호", value: extracted.phoneNumber });
	}

	// consultationData 파싱하여 각 항목을 개별적으로 추가
	if (consultationData) {
		const parsedConsultation = parseConsultationData(consultationData);
		parsedConsultation.forEach((item) => {
			// 이미 추가된 필드와 중복되지 않도록 확인
			const existingLabels = info.map((i) => i.label);
			if (!existingLabels.includes(item.label)) {
				info.push(item);
			}
		});
	}

	// additionalInfo의 나머지 필드 추가 (이미 추가된 필드는 제외)
	if (extracted.additionalInfo) {
		const excludedKeys = [
			"name",
			"age",
			"previousSchool",
			"targetUniversity",
			"phoneNumber",
			"major",
			"currentGrade",
			"desiredSemester",
			"consultationData",
			"track",
		];
		const existingLabels = info.map((i) => i.label);

		Object.entries(extracted.additionalInfo).forEach(([key, value]) => {
			// 이미 추가된 필드나 제외할 필드는 제외
			if (
				!excludedKeys.includes(key) &&
				!existingLabels.includes(key) &&
				value != null
			) {
				info.push({
					label: key,
					value: String(value || "없음"),
				});
			}
		});
	}

	return info;
};

const RegistrationPage = () => {
	const [studentMessageGroups, setStudentMessageGroups] = useState<
		StudentMessageGroup[]
	>([]);
	const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
		null,
	);
	const [teachers, setTeachers] = useState<TeacherDTO[]>([]);
	const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
	const [isAnalyzingModalOpen, setIsAnalyzingModalOpen] = useState(false);
	const [isResultModalOpen, setIsResultModalOpen] = useState(false);
	const [transferResponse, setTransferResponse] =
		useState<TransferToTeacherResponseDTO | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// teacherId가 배정되지 않은 학생들과 메시지들을 가져와서 학생별로 그룹화
	useEffect(() => {
		const fetchUnassignedData = async () => {
			setIsLoading(true);
			try {
				// 1. /api/students에서 assignedTeacherId가 null인 학생들 가져오기
				const studentsResponse = await studentApi.getAll();
				const unassignedStudents: StudentDTO[] = [];
				if (studentsResponse.isSuccess && studentsResponse.result) {
					unassignedStudents.push(
						...studentsResponse.result.filter(
							(student) => student.assignedTeacherId == null,
						),
					);
				}

				// 2. /api/messages에서 teacherId가 null인 메시지들 가져오기
				const messagesResponse = await messageApi.getAll(100);
				const unassignedMessages: MessageDTO[] = [];
				if (messagesResponse.isSuccess && messagesResponse.result) {
					// 이미 전송된 메시지 ID 목록 가져오기
					const sentMessageIds = getSentMessageIds();

					// teacherId가 null이고, 전송되지 않은 메시지만 필터링
					unassignedMessages.push(
						...messagesResponse.result.filter(
							(msg) =>
								msg.teacherId == null &&
								msg.studentId != null &&
								!sentMessageIds.has(msg.messageId),
						),
					);
				}

				// 3. 학생별로 그룹화 (학생 정보와 메시지 병합)
				const grouped = new Map<number, StudentMessageGroup>();

				// 먼저 학생 정보로 그룹 생성
				unassignedStudents.forEach((student) => {
					grouped.set(student.studentId, {
						studentId: student.studentId,
						messages: [],
						studentInfo: student,
					});
				});

				// 메시지를 그룹에 추가
				unassignedMessages.forEach((msg) => {
					if (msg.studentId != null) {
						const studentId = msg.studentId;
						if (!grouped.has(studentId)) {
							grouped.set(studentId, {
								studentId,
								messages: [],
							});
						}
						const group = grouped.get(studentId);
						if (group) {
							group.messages.push(msg);
						}
					}
				});

				// 4. 각 학생의 메시지를 sentAt 기준으로 정렬
				const groups: StudentMessageGroup[] = Array.from(grouped.values()).map(
					(group) => ({
						...group,
						messages: group.messages.sort((a, b) => {
							const dateA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
							const dateB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
							return dateB - dateA; // 최신순
						}),
					}),
				);

				setStudentMessageGroups(groups);
			} catch (error) {
				console.error("데이터 조회 실패:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUnassignedData();
	}, []);

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
	const handleChannelGuideClick = (studentId: number) => {
		setSelectedStudentId(studentId);
		setIsTeacherModalOpen(true);
	};

	// 선생님 선택 핸들러
	const handleTeacherSelect = async (teacherId: number) => {
		if (!selectedStudentId) return;

		setIsTeacherModalOpen(false);
		setIsAnalyzingModalOpen(true);

		try {
			// 선택된 학생의 메시지 ID들을 가져오기
			const selectedGroup = studentMessageGroups.find(
				(group) => group.studentId === selectedStudentId,
			);
			const messageIds =
				selectedGroup?.messages.map((msg) => msg.messageId) || [];

			// /api/transfer/to-teacher 호출
			const response = await transferApi.transferToTeacher({
				studentId: selectedStudentId,
				teacherId,
			});

			if (response.isSuccess && response.result) {
				// 전송된 메시지 ID들을 저장
				if (messageIds.length > 0) {
					saveSentMessageIds(messageIds);
				}

				setTransferResponse(response.result);
				setIsAnalyzingModalOpen(false);
				setIsResultModalOpen(true);
				// 전송된 학생을 목록에서 제거
				setStudentMessageGroups((prev) =>
					prev.filter((group) => group.studentId !== selectedStudentId),
				);
			} else {
				throw new Error(response.message || "전송 실패");
			}
		} catch (error) {
			console.error("학생 전환 실패:", error);
			alert(
				error instanceof Error
					? error.message
					: "학생 전환 중 오류가 발생했습니다.",
			);
			setIsAnalyzingModalOpen(false);
		}
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
									{studentMessageGroups.length}
								</Typography>
								<Typography variant="small" className="text-gray-600">
									등록 진행 중
								</Typography>
							</div>
						</div>
						<Typography variant="body-secondary">
							개별 카카오톡 채널 안내
						</Typography>
					</div>

					<div className="space-y-6">
						{/* Students List */}
						{isLoading ? (
							<div className="flex justify-center items-center py-12">
								<Loader2 className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{studentMessageGroups.map((group) => {
									const displayName = group.studentInfo?.name
										? `${group.studentInfo.name}`
										: `새학생 (${group.studentId})`;

									return (
										<Card key={group.studentId} padding="lg">
											<div className="flex justify-between items-start mb-6">
												<div className="flex items-center gap-4">
													<div className="flex items-center">
														<Typography variant="h3">{displayName}</Typography>
													</div>
												</div>
											</div>

											<div className="flex flex-col gap-6">
												{/* 메시지 내용 */}
												{group.messages.length > 0 ? (
													<Card
														padding="md"
														className="bg-gray-50 border border-gray-200"
													>
														<div className="space-y-3">
															{group.messages.slice(0, 3).map((message) => (
																<div
																	key={message.messageId}
																	className="pb-3 border-b border-gray-200 last:border-0 last:pb-0"
																>
																	<div className="flex justify-between items-start mb-1">
																		<Typography
																			variant="body-secondary"
																			className="text-xs text-gray-500"
																		>
																			{message.sentAt
																				? formatTemporalDateTime(
																						fromJSDate(
																							new Date(message.sentAt),
																						),
																						"MM/dd HH:mm",
																					)
																				: "시간 정보 없음"}
																		</Typography>
																	</div>
																	<Typography
																		variant="small"
																		className="text-gray-700"
																	>
																		{message.content}
																	</Typography>
																</div>
															))}
															{group.messages.length > 3 && (
																<Typography
																	variant="body-secondary"
																	className="text-xs text-gray-500 text-center"
																>
																	외 {group.messages.length - 3}개의 메시지
																</Typography>
															)}
														</div>
													</Card>
												) : (
													<Card
														padding="md"
														className="bg-gray-50 border border-gray-200"
													>
														<Typography
															variant="body-secondary"
															className="text-center text-gray-500"
														>
															메시지가 없습니다
														</Typography>
													</Card>
												)}

												{/* 개별 채널 안내 버튼 */}
												<Button
													variant="secondary"
													size="sm"
													className="w-full"
													onClick={() =>
														handleChannelGuideClick(group.studentId)
													}
												>
													개별 채널 안내
												</Button>
											</div>
										</Card>
									);
								})}

								{studentMessageGroups.length === 0 && (
									<div className="col-span-full">
										<Card padding="lg" className="text-center">
											<FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
											<Typography variant="h3" className="mb-2">
												등록 진행 중인 학생이 없습니다
											</Typography>
											<Typography variant="body-secondary">
												선생님이 배정되지 않은 학생들이 여기에 표시됩니다.
											</Typography>
										</Card>
									</div>
								)}
							</div>
						)}

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
									학생을 담당할 선생님을 선택해주세요.
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
												onClick={() => handleTeacherSelect(teacher.teacherId)}
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
								setTransferResponse(null);
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
								{transferResponse && (
									<>
										<div className="space-y-2 mb-4">
											<Typography variant="small" className="font-medium">
												학생 ID: {transferResponse.studentId}
											</Typography>
											{transferResponse.studentName && (
												<Typography variant="small" className="font-medium">
													학생 이름: {transferResponse.studentName}
												</Typography>
											)}
											<Typography variant="small" className="font-medium">
												배정된 선생님: {transferResponse.teacherName} (
												{transferResponse.assignedTeacherId})
											</Typography>
											{transferResponse.savedMessageCount !== undefined && (
												<Typography variant="small" className="font-medium">
													저장된 메시지 수: {transferResponse.savedMessageCount}
													개
												</Typography>
											)}
										</div>
										<Card
											padding="md"
											className="bg-gray-50 max-h-[500px] overflow-y-auto"
										>
											<div className="space-y-2">
												{formatExtractedInfo(transferResponse).map(
													(info, idx) => (
														<div
															key={`${info.label}-${idx}`}
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
													),
												)}
												{formatExtractedInfo(transferResponse).length === 0 && (
													<Typography variant="body-secondary">
														추출된 정보가 없습니다.
													</Typography>
												)}
											</div>
										</Card>
									</>
								)}
								<div className="flex justify-end">
									<Button
										onClick={() => {
											setIsResultModalOpen(false);
											setSelectedStudentId(null);
											setTransferResponse(null);
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
