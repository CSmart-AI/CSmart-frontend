import { Clock, MapPin, Phone, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Input, Typography } from "@/components/ui";
import { mockStudents } from "@/data/mockData";
import type { Student } from "@/types/student";
import { formatTemporalDateTime } from "@/utils/temporal";

const ConsultationPage = () => {
	const [searchTerm, setSearchTerm] = useState("");

	const consultationStudents = mockStudents.filter(
		(student) => student.status === "consultation",
	);

	const filteredStudents = consultationStudents.filter(
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

	return (
		<div className="flex min-h-[calc(100vh-var(--header-height))]">
			{/* Main Content Area */}
			<main className="flex-1 bg-gray-50">
				<div className="w-full px-[var(--page-padding-inline)] py-6">
					{/* Page Header */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Phone className="h-5 w-5 text-[var(--color-primary)]" />
								<Typography variant="h3">상담 관리</Typography>
							</div>
							<div className="text-right">
								<Typography
									variant="h2"
									className="text-[var(--color-primary)]"
								>
									{consultationStudents.length}
								</Typography>
								<Typography variant="small" className="text-gray-600">
									상담 대기 중
								</Typography>
							</div>
						</div>
						<Typography variant="body-secondary">
							신규 학생 상담 및 전화 상담 예약 관리
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
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<div className="flex items-center gap-4 mb-4">
													<div className="flex items-center gap-2">
														<Typography variant="h3">
															{student.info.name}
														</Typography>
														<Typography variant="body-secondary">
															({student.info.age}세, {student.info.type})
														</Typography>
													</div>
													{unreadCount > 0 && (
														<Badge variant="danger">{unreadCount}</Badge>
													)}
												</div>

												<div className="grid grid-cols-2 gap-6 mb-4">
													<div className="space-y-3">
														<div className="flex items-center text-sm text-gray-600">
															<Phone className="h-4 w-4 mr-2 shrink-0" />
															{student.info.phone}
														</div>
														<div className="flex items-center text-sm text-gray-600">
															<Clock className="h-4 w-4 mr-2 shrink-0" />
															통화 가능: {student.info.availableCallTime}
														</div>
														<div className="flex items-center text-sm text-gray-600">
															<MapPin className="h-4 w-4 mr-2 shrink-0" />
															유입: {student.info.source}
														</div>
													</div>
													<div className="space-y-3">
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															<span className="font-medium text-gray-900">
																목표:
															</span>{" "}
															{student.info.targetUniversity}{" "}
															{student.info.targetMajor}
														</Typography>
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															<span className="font-medium text-gray-900">
																전적:
															</span>{" "}
															{student.info.previousEducation}
														</Typography>
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															<span className="font-medium text-gray-900">
																계열:
															</span>{" "}
															{student.info.track}
														</Typography>
													</div>
												</div>

												{student.info.message && (
													<Card
														padding="md"
														className="mb-4 bg-[var(--color-primary)]/10 border border-gray-200"
													>
														<Typography
															variant="body-secondary"
															className="text-sm"
														>
															<span className="font-medium text-[var(--color-primary)]">
																"
															</span>
															{student.info.message}
															<span className="font-medium text-[var(--color-primary)]">
																"
															</span>
														</Typography>
													</Card>
												)}

												<Card
													padding="md"
													className="bg-white/50 border border-gray-200"
												>
													<div className="flex items-center justify-between mb-2">
														<Typography variant="small" className="font-medium">
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
														className="line-clamp-2"
													>
														{lastMessage}
													</Typography>
												</Card>
											</div>

											<div className="flex flex-col gap-2 ml-6">
												<Link to={`/student/${student.info.id}`}>
													<Button size="md" className="w-full">
														상세보기
													</Button>
												</Link>
											</div>
										</div>

										{student.specialNotes && (
											<div className="mt-4 pt-4 border-t border-gray-200">
												<Card
													padding="md"
													className="bg-[var(--color-yellow)]/10 border border-gray-200"
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
											</div>
										)}
									</Card>
								);
							})}

							{filteredStudents.length === 0 && (
								<Card padding="lg" className="text-center">
									<User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
									<Typography variant="h3" className="mb-2">
										상담 대기 중인 학생이 없습니다
									</Typography>
									<Typography variant="body-secondary">
										새로운 상담 신청이 들어오면 여기에 표시됩니다.
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

export default ConsultationPage;
