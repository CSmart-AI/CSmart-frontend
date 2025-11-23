import {
	Award,
	Calculator,
	CheckCircle,
	Clock,
	CreditCard,
	FileText,
	MessageCircle,
	User,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Input, Typography } from "@/components/ui";
import { mockStudents } from "@/data/mockData";
import type { Student } from "@/types/student";
import { formatTemporalDate, formatTemporalDateTime } from "@/utils/temporal";

const RegistrationPage = () => {
	const [searchTerm, setSearchTerm] = useState("");

	const registrationStudents = mockStudents.filter(
		(student) => student.status === "registration",
	);

	const filteredStudents = registrationStudents.filter(
		(student) =>
			student.info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.info.phone.includes(searchTerm),
	);

	const getLastMessage = (student: Student) => {
		const lastMessage = student.kakaoMessages[student.kakaoMessages.length - 1];
		return lastMessage ? lastMessage.message : "메시지 없음";
	};

	const getUnreadCount = (student: Student) => {
		return student.kakaoMessages.filter(
			(msg) => !msg.isRead && msg.sender === "student",
		).length;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "완료":
				return "success";
			case "대기":
				return "warning";
			case "취소":
				return "danger";
			default:
				return "default";
		}
	};

	return (
		<div className="flex min-h-[calc(100vh-var(--header-height))]">
			{/* Main Content Area */}
			<main className="flex-1 bg-[var(--color-background)]">
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
									{registrationStudents.length}
								</Typography>
								<Typography
									variant="small"
									className="text-[var(--color-text-secondary)]"
								>
									등록 진행 중
								</Typography>
							</div>
						</div>
						<Typography variant="body-secondary">
							배치고사 및 해설지 배급, 개별 카카오톡 채널 안내
						</Typography>
					</div>

					<div className="space-y-6">
						{/* Search */}
						<Card padding="md">
							<Input
								type="text"
								placeholder="학생 이름 또는 전화번호로 검색..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								icon={<User className="h-4 w-4" />}
							/>
						</Card>

						{/* Students List */}
						<div className="space-y-4">
							{filteredStudents.map((student) => {
								const unreadCount = getUnreadCount(student);
								const lastMessage = getLastMessage(student);

								return (
									<Card key={student.info.id} padding="lg">
										<div className="flex justify-between items-start mb-6">
											<div className="flex items-center gap-4">
												<div className="flex items-center">
													<Typography variant="h3">
														{student.info.name}
													</Typography>
													<Typography variant="body-secondary" className="ml-2">
														({student.info.age}세, {student.info.type})
													</Typography>
												</div>
												{unreadCount > 0 && (
													<Badge variant="danger">{unreadCount}</Badge>
												)}
											</div>
											<div className="flex gap-2">
												<Link to={`/student/${student.info.id}`}>
													<Button size="md">상세보기</Button>
												</Link>
											</div>
										</div>

										<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
											{/* Payment Information */}
											<Card
												padding="md"
												className="bg-[var(--color-primary)]/10 border border-[rgba(255,255,255,0.05)]"
											>
												<div className="flex items-center mb-3">
													<CreditCard className="h-5 w-5 text-[var(--color-primary)] mr-2" />
													<Typography
														variant="h4"
														className="text-[var(--color-primary)]"
													>
														결제 정보
													</Typography>
												</div>
												{student.payment ? (
													<div className="space-y-2">
														<div className="flex justify-between items-center">
															<Typography
																variant="body-secondary"
																className="text-sm"
															>
																상태:
															</Typography>
															<Badge
																variant={
																	getStatusColor(student.payment.status) as
																		| "default"
																		| "primary"
																		| "success"
																		| "warning"
																		| "danger"
																}
															>
																{student.payment.status}
															</Badge>
														</div>
														<div className="flex justify-between items-center">
															<Typography
																variant="body-secondary"
																className="text-sm"
															>
																금액:
															</Typography>
															<Typography
																variant="small"
																className="font-medium"
															>
																{student.payment.amount.toLocaleString()}원
															</Typography>
														</div>
														<div className="flex justify-between items-center">
															<Typography
																variant="body-secondary"
																className="text-sm"
															>
																방법:
															</Typography>
															<Typography variant="small">
																{student.payment.method}
															</Typography>
														</div>
														<div className="flex justify-between items-center">
															<Typography
																variant="body-secondary"
																className="text-sm"
															>
																과정:
															</Typography>
															<Typography variant="small">
																{student.payment.course}
															</Typography>
														</div>
														<div className="flex justify-between items-center">
															<Typography
																variant="body-secondary"
																className="text-sm"
															>
																일시:
															</Typography>
															<Typography variant="small">
																{formatTemporalDate(
																	student.payment.paymentDate,
																	"MM/dd",
																)}
															</Typography>
														</div>
													</div>
												) : (
													<Typography
														variant="body-secondary"
														className="text-sm"
													>
														결제 정보 없음
													</Typography>
												)}
											</Card>

											{/* Placement Test */}
											<Card
												padding="md"
												className="bg-[var(--color-green)]/10 border border-[rgba(255,255,255,0.05)]"
											>
												<div className="flex items-center mb-3">
													<Calculator className="h-5 w-5 text-[var(--color-green)] mr-2" />
													<Typography
														variant="h4"
														className="text-[var(--color-green)]"
													>
														배치고사
													</Typography>
												</div>
												{student.placementTest ? (
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
														<div className="flex justify-between items-center">
															<Typography
																variant="body-secondary"
																className="text-sm"
															>
																해설지:
															</Typography>
															<div className="flex items-center">
																{student.placementTest.explanationProvided ? (
																	<>
																		<CheckCircle className="h-4 w-4 text-[var(--color-green)] mr-1" />
																		<Typography
																			variant="small"
																			className="text-[var(--color-green)]"
																		>
																			배급완료
																		</Typography>
																	</>
																) : (
																	<>
																		<XCircle className="h-4 w-4 text-[var(--color-red)] mr-1" />
																		<Typography
																			variant="small"
																			className="text-[var(--color-red)]"
																		>
																			미배급
																		</Typography>
																	</>
																)}
															</div>
														</div>
													</div>
												) : (
													<div className="space-y-2">
														<div className="flex items-center text-[var(--color-yellow)]">
															<Clock className="h-4 w-4 mr-1" />
															<Typography variant="small">
																배치고사 대기
															</Typography>
														</div>
														<Button
															variant="secondary"
															size="sm"
															className="w-full"
														>
															배치고사 일정 안내
														</Button>
													</div>
												)}
											</Card>

											{/* Progress Status */}
											<Card
												padding="md"
												className="bg-[var(--color-primary)]/10 border border-[rgba(255,255,255,0.05)]"
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
															결제
														</Typography>
														{student.payment?.status === "완료" ? (
															<CheckCircle className="h-4 w-4 text-[var(--color-green)]" />
														) : (
															<Clock className="h-4 w-4 text-[var(--color-yellow)]" />
														)}
													</div>
													<div className="flex items-center justify-between">
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															배치고사
														</Typography>
														{student.placementTest ? (
															<CheckCircle className="h-4 w-4 text-[var(--color-green)]" />
														) : (
															<Clock className="h-4 w-4 text-[var(--color-yellow)]" />
														)}
													</div>
													<div className="flex items-center justify-between">
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															해설지
														</Typography>
														{student.placementTest?.explanationProvided ? (
															<CheckCircle className="h-4 w-4 text-[var(--color-green)]" />
														) : (
															<Clock className="h-4 w-4 text-[var(--color-yellow)]" />
														)}
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
													>
														개별 채널 안내(??)
													</Button>
												</div>
											</Card>
										</div>

										{/* Recent Message */}
										<Card
											padding="md"
											className="mt-6 bg-[var(--color-dark)]/50 border border-[rgba(255,255,255,0.05)]"
										>
											<div className="flex items-center justify-between mb-2">
												<Typography
													variant="small"
													className="font-medium flex items-center"
												>
													<MessageCircle className="h-4 w-4 mr-2" />
													최근 카카오톡
												</Typography>
												<Typography variant="small" className="text-xs">
													{formatTemporalDateTime(
														student.lastActivity,
														"MM/dd HH:mm",
													)}
												</Typography>
											</div>
											<Typography
												variant="body-secondary"
												className="line-clamp-2 text-sm"
											>
												{lastMessage}
											</Typography>
										</Card>

										{student.specialNotes && (
											<Card
												padding="sm"
												className="mt-4 bg-[var(--color-yellow)]/10 border border-[rgba(255,255,255,0.05)]"
											>
												<div className="flex items-center">
													<Typography
														variant="small"
														className="font-medium text-[var(--color-yellow)] mr-2"
													>
														특이사항:
													</Typography>
													<Typography
														variant="small"
														className="text-[var(--color-yellow)]"
													>
														{student.specialNotes}
													</Typography>
												</div>
											</Card>
										)}
									</Card>
								);
							})}

							{filteredStudents.length === 0 && (
								<Card padding="lg" className="text-center">
									<FileText className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
									<Typography variant="h3" className="mb-2">
										등록 진행 중인 학생이 없습니다
									</Typography>
									<Typography variant="body-secondary">
										상담이 완료되어 등록 중인 학생들이 여기에 표시됩니다.
									</Typography>
								</Card>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default RegistrationPage;
