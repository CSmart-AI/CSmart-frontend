import {
	AlertCircle,
	Clock,
	Filter,
	MessageCircle,
	Search,
	TrendingUp,
	Trophy,
	User,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Input, Typography } from "@/components/ui";
import { mockStudents } from "@/data/mockData";
import type { Student } from "@/types/student";
import { cn } from "@/utils/cn";
import { formatTemporalDateTime, toJSDate } from "@/utils/temporal";

const ManagementPage = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<"name" | "lastActivity" | "score">(
		"lastActivity",
	);

	const managementStudents = mockStudents.filter(
		(student) => student.status === "management",
	);

	const filteredStudents = managementStudents
		.filter(
			(student) =>
				student.info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				student.info.phone.includes(searchTerm) ||
				student.info.targetUniversity
					.toLowerCase()
					.includes(searchTerm.toLowerCase()),
		)
		.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.info.name.localeCompare(b.info.name);
				case "lastActivity": {
					return (
						toJSDate(b.lastActivity).getTime() -
						toJSDate(a.lastActivity).getTime()
					);
				}
				case "score": {
					const scoreA = a.placementTest?.totalScore || 0;
					const scoreB = b.placementTest?.totalScore || 0;
					return scoreB - scoreA;
				}
				default:
					return 0;
			}
		});

	const getLastMessage = (student: Student) => {
		const lastMessage = student.kakaoMessages[student.kakaoMessages.length - 1];
		return lastMessage ? lastMessage.message : "메시지 없음";
	};

	const getUnreadCount = (student: Student) => {
		return student.kakaoMessages.filter(
			(msg) => !msg.isRead && msg.sender === "student",
		).length;
	};

	const getScoreGrade = (score?: number) => {
		if (!score) return { grade: "N/A", color: "text-gray-600" };
		if (score >= 250) return { grade: "A", color: "text-[var(--color-green)]" };
		if (score >= 200)
			return { grade: "B", color: "text-[var(--color-primary)]" };
		if (score >= 150)
			return { grade: "C", color: "text-[var(--color-yellow)]" };
		return { grade: "D", color: "text-[var(--color-red)]" };
	};

	const totalUnread = managementStudents.reduce(
		(sum, student) => sum + getUnreadCount(student),
		0,
	);

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
						{/* Stats */}
						<Card padding="lg">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<Card
									padding="md"
									className="bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20"
								>
									<div className="flex items-center">
										<User className="h-8 w-8 text-[var(--color-primary)]" />
										<div className="ml-3">
											<Typography
												variant="h2"
												className="text-[var(--color-primary)]"
											>
												{managementStudents.length}
											</Typography>
											<Typography variant="small">총 수강생</Typography>
										</div>
									</div>
								</Card>

								<Card
									padding="md"
									className="bg-[var(--color-red)]/10 border-[var(--color-red)]/20"
								>
									<div className="flex items-center">
										<MessageCircle className="h-8 w-8 text-[var(--color-red)]" />
										<div className="ml-3">
											<Typography
												variant="h2"
												className="text-[var(--color-red)]"
											>
												{totalUnread}
											</Typography>
											<Typography variant="small">읽지 않은 메시지</Typography>
										</div>
									</div>
								</Card>

								<Card
									padding="md"
									className="bg-[var(--color-green)]/10 border-[var(--color-green)]/20"
								>
									<div className="flex items-center">
										<Trophy className="h-8 w-8 text-[var(--color-green)]" />
										<div className="ml-3">
											<Typography
												variant="h2"
												className="text-[var(--color-green)]"
											>
												{Math.round(
													managementStudents.reduce(
														(sum, s) =>
															sum + (s.placementTest?.totalScore || 0),
														0,
													) / managementStudents.length,
												)}
											</Typography>
											<Typography variant="small">평균 점수</Typography>
										</div>
									</div>
								</Card>

								<Card
									padding="md"
									className="bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20"
								>
									<div className="flex items-center">
										<TrendingUp className="h-8 w-8 text-[var(--color-primary)]" />
										<div className="ml-3">
											<Typography
												variant="h2"
												className="text-[var(--color-primary)]"
											>
												{
													managementStudents.filter(
														(s) =>
															toJSDate(s.lastActivity) >
															new Date(Date.now() - 24 * 60 * 60 * 1000),
													).length
												}
											</Typography>
											<Typography variant="small">24시간 내 활동</Typography>
										</div>
									</div>
								</Card>
							</div>
						</Card>

						{/* Search & Filter */}
						<Card padding="md">
							<div className="flex flex-col md:flex-row gap-4">
								<div className="flex-1">
									<Input
										type="text"
										placeholder="학생 이름, 전화번호, 목표대학으로 검색..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										icon={<Search className="h-4 w-4" />}
									/>
								</div>
								<div className="flex items-center gap-2">
									<Filter className="h-4 w-4 text-gray-600" />
									<select
										value={sortBy}
										onChange={(e) =>
											setSortBy(
												e.target.value as "name" | "lastActivity" | "score",
											)
										}
										className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)] focus:border-transparent"
									>
										<option value="lastActivity">최근 활동순</option>
										<option value="name">이름순</option>
										<option value="score">점수순</option>
									</select>
								</div>
							</div>
						</Card>

						{/* Students Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{filteredStudents.map((student) => {
								const unreadCount = getUnreadCount(student);
								const lastMessage = getLastMessage(student);
								const scoreGrade = getScoreGrade(
									student.placementTest?.totalScore,
								);

								return (
									<Card
										key={student.info.id}
										padding="lg"
										className="hover:border-gray-300 transition-all border border-gray-200"
									>
										<div className="flex justify-between items-start mb-4">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/70 rounded-full flex items-center justify-center text-white font-semibold">
													{student.info.name[0]}
												</div>
												<div>
													<Typography variant="h3">
														{student.info.name}
													</Typography>
													<Typography
														variant="body-secondary"
														className="text-sm"
													>
														{student.info.age}세 · {student.info.type} ·{" "}
														{student.info.track}
													</Typography>
												</div>
											</div>
											{unreadCount > 0 && (
												<Badge variant="danger">{unreadCount}</Badge>
											)}
										</div>

										<div className="space-y-3 mb-4">
											<div className="flex items-center justify-between">
												<Typography
													variant="body-secondary"
													className="text-sm"
												>
													목표대학
												</Typography>
												<Typography variant="small" className="font-medium">
													{student.info.targetUniversity}{" "}
													{student.info.targetMajor}
												</Typography>
											</div>

											{student.placementTest && (
												<div className="flex items-center justify-between">
													<Typography
														variant="body-secondary"
														className="text-sm"
													>
														배치고사
													</Typography>
													<div className="flex items-center gap-2">
														<Typography variant="small" className="font-medium">
															{student.placementTest.totalScore}/300
														</Typography>
														<Badge
															variant="default"
															className={cn("text-xs", scoreGrade.color)}
														>
															{scoreGrade.grade}
														</Badge>
													</div>
												</div>
											)}

											{student.payment && (
												<div className="flex items-center justify-between">
													<Typography
														variant="body-secondary"
														className="text-sm"
													>
														수강과정
													</Typography>
													<Typography variant="small" className="font-medium">
														{student.payment.course}
													</Typography>
												</div>
											)}

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
															student.lastActivity,
															"MM/dd HH:mm",
														)}
													</Typography>
												</div>
											</div>
										</div>

										{/* Recent Message Preview */}
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
												<Typography variant="small" className="text-xs">
													{formatTemporalDateTime(
														student.lastActivity,
														"MM/dd HH:mm",
													)}
												</Typography>
											</div>
											<Typography
												variant="body-secondary"
												className="line-clamp-2 text-xs"
											>
												{lastMessage}
											</Typography>
										</Card>

										{/* Action Buttons */}
										<div className="flex gap-2">
											<Link
												to={`/student/${student.info.id}`}
												className="flex-1"
											>
												<Button className="w-full">상세보기</Button>
											</Link>
										</div>

										{/* Special Notes */}
										{student.specialNotes && (
											<div className="mt-4 pt-4 border-t border-gray-200">
												<div className="flex items-start gap-2">
													<AlertCircle className="h-4 w-4 text-[var(--color-yellow)] mt-0.5 flex-shrink-0" />
													<Typography variant="small">
														{student.specialNotes}
													</Typography>
												</div>
											</div>
										)}
									</Card>
								);
							})}

							{filteredStudents.length === 0 && (
								<Card padding="lg" className="text-center">
									<User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
									<Typography variant="h3" className="mb-2">
										관리 중인 학생이 없습니다
									</Typography>
									<Typography variant="body-secondary">
										등록이 완료된 학생들이 여기에 표시됩니다.
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

export default ManagementPage;
