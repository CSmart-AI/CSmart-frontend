import {
	AlertCircle,
	Clock,
	Filter,
	MessageCircle,
	Search,
	TrendingUp,
	Trophy,
	User,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { mockStudents } from "@/data/mockData";
import type { Student } from "@/types/student";
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
		if (!score) return { grade: "N/A", color: "text-gray-400" };
		if (score >= 250) return { grade: "A", color: "text-green-600" };
		if (score >= 200) return { grade: "B", color: "text-blue-600" };
		if (score >= 150) return { grade: "C", color: "text-yellow-600" };
		return { grade: "D", color: "text-red-600" };
	};

	const totalUnread = managementStudents.reduce(
		(sum, student) => sum + getUnreadCount(student),
		0,
	);

	return (
		<div className="space-y-6">
			{/* Header & Stats */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
						<p className="text-gray-600 mt-1">
							수강 중인 학생들의 개별 질문 및 학습 진도 관리
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="bg-blue-50 p-4 rounded-lg">
						<div className="flex items-center">
							<User className="h-8 w-8 text-blue-600" />
							<div className="ml-3">
								<div className="text-2xl font-bold text-blue-600">
									{managementStudents.length}
								</div>
								<div className="text-sm text-blue-800">총 수강생</div>
							</div>
						</div>
					</div>

					<div className="bg-red-50 p-4 rounded-lg">
						<div className="flex items-center">
							<MessageCircle className="h-8 w-8 text-red-600" />
							<div className="ml-3">
								<div className="text-2xl font-bold text-red-600">
									{totalUnread}
								</div>
								<div className="text-sm text-red-800">읽지 않은 메시지</div>
							</div>
						</div>
					</div>

					<div className="bg-green-50 p-4 rounded-lg">
						<div className="flex items-center">
							<Trophy className="h-8 w-8 text-green-600" />
							<div className="ml-3">
								<div className="text-2xl font-bold text-green-600">
									{Math.round(
										managementStudents.reduce(
											(sum, s) => sum + (s.placementTest?.totalScore || 0),
											0,
										) / managementStudents.length,
									)}
								</div>
								<div className="text-sm text-green-800">평균 점수</div>
							</div>
						</div>
					</div>

					<div className="bg-purple-50 p-4 rounded-lg">
						<div className="flex items-center">
							<TrendingUp className="h-8 w-8 text-purple-600" />
							<div className="ml-3">
								<div className="text-2xl font-bold text-purple-600">
									{
										managementStudents.filter(
											(s) =>
												toJSDate(s.lastActivity) >
												new Date(Date.now() - 24 * 60 * 60 * 1000),
										).length
									}
								</div>
								<div className="text-sm text-purple-800">24시간 내 활동</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Search & Filter */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
						<input
							type="text"
							placeholder="학생 이름, 전화번호, 목표대학으로 검색..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div className="flex items-center gap-2">
						<Filter className="h-5 w-5 text-gray-400" />
						<select
							value={sortBy}
							onChange={(e) =>
								setSortBy(e.target.value as "name" | "lastActivity" | "score")
							}
							className="border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="lastActivity">최근 활동순</option>
							<option value="name">이름순</option>
							<option value="score">점수순</option>
						</select>
					</div>
				</div>
			</div>

			{/* Students Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{filteredStudents.map((student) => {
					const unreadCount = getUnreadCount(student);
					const lastMessage = getLastMessage(student);
					const scoreGrade = getScoreGrade(student.placementTest?.totalScore);

					return (
						<div
							key={student.info.id}
							className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
						>
							<div className="flex justify-between items-start mb-4">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
										{student.info.name[0]}
									</div>
									<div>
										<h3 className="text-lg font-semibold text-gray-900">
											{student.info.name}
										</h3>
										<p className="text-sm text-gray-600">
											{student.info.age}세 · {student.info.type} ·{" "}
											{student.info.track}
										</p>
									</div>
								</div>
								{unreadCount > 0 && (
									<span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
										{unreadCount}
									</span>
								)}
							</div>

							<div className="space-y-3 mb-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">목표대학</span>
									<span className="text-sm font-medium">
										{student.info.targetUniversity} {student.info.targetMajor}
									</span>
								</div>

								{student.placementTest && (
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">배치고사</span>
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium">
												{student.placementTest.totalScore}/300
											</span>
											<span
												className={`text-xs font-bold px-2 py-1 rounded ${scoreGrade.color} bg-gray-100`}
											>
												{scoreGrade.grade}
											</span>
										</div>
									</div>
								)}

								{student.payment && (
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">수강과정</span>
										<span className="text-sm font-medium">
											{student.payment.course}
										</span>
									</div>
								)}

								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">마지막 활동</span>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-gray-400" />
										<span className="text-sm">
											{formatTemporalDateTime(
												student.lastActivity,
												"MM/dd HH:mm",
											)}
										</span>
									</div>
								</div>
							</div>

							{/* Recent Message Preview */}
							<div className="bg-gray-50 p-3 rounded-lg mb-4">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-medium text-gray-700 flex items-center">
										<MessageCircle className="h-3 w-3 mr-1" />
										최근 메시지
									</span>
									<span className="text-xs text-gray-500">
										{formatTemporalDateTime(
											student.lastActivity,
											"MM/dd HH:mm",
										)}
									</span>
								</div>
								<p className="text-xs text-gray-600 line-clamp-2">
									{lastMessage}
								</p>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2">
								<Link
									to={`/student/${student.info.id}`}
									className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
								>
									상세보기
								</Link>
							</div>

							{/* Special Notes */}
							{student.specialNotes && (
								<div className="mt-4 pt-4 border-t border-gray-200">
									<div className="flex items-start gap-2">
										<AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
										<p className="text-xs text-gray-600">
											{student.specialNotes}
										</p>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{filteredStudents.length === 0 && (
				<div className="bg-white rounded-lg shadow-sm p-12 text-center">
					<User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						관리 중인 학생이 없습니다
					</h3>
					<p className="text-gray-600">
						등록이 완료된 학생들이 여기에 표시됩니다.
					</p>
				</div>
			)}
		</div>
	);
};

export default ManagementPage;
