import {
	AlertCircle,
	Clock,
	Filter,
	MessageCircle,
	Search,
	User,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Typography } from "@/components/ui";
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
						{/* Search & Filter */}
						<div className="flex flex-col sm:flex-row gap-3">
							{/* 검색 입력 */}
							<div className="flex-1 relative">
								<div className="relative">
									<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
									<input
										type="text"
										placeholder="학생 이름, 전화번호, 목표대학으로 검색..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)] focus:border-transparent transition-all shadow-sm hover:border-gray-300"
									/>
									{searchTerm && (
										<button
											type="button"
											onClick={() => setSearchTerm("")}
											className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
											aria-label="검색어 지우기"
										>
											<X className="h-4 w-4 text-gray-400" />
										</button>
									)}
								</div>
							</div>

							{/* 정렬 필터 */}
							<div className="relative">
								<select
									value={sortBy}
									onChange={(e) =>
										setSortBy(
											e.target.value as "name" | "lastActivity" | "score",
										)
									}
									className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)] focus:border-transparent transition-all shadow-sm hover:border-gray-300 appearance-none cursor-pointer min-w-[160px]"
								>
									<option value="lastActivity">최근 활동순</option>
									<option value="name">이름순</option>
									<option value="score">점수순</option>
								</select>
								<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
									<svg
										className="h-4 w-4 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<title>드롭다운 화살표</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</div>
						</div>

						{/* Students Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
					</div>
				</div>
			</main>
		</div>
	);
};

export default ManagementPage;
