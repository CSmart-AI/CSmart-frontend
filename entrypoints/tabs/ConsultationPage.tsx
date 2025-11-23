import { Clock, MapPin, Phone, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
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
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">상담 관리</h1>
						<p className="text-gray-600 mt-1">
							신규 학생 상담 및 전화 상담 예약 관리
						</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-right">
							<div className="text-3xl font-bold text-blue-600">
								{consultationStudents.length}
							</div>
							<div className="text-sm text-gray-600">상담 대기 중</div>
						</div>
					</div>
				</div>
			</div>

			{/* Search */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="relative">
					<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
					<input
						type="text"
						placeholder="학생 이름 또는 전화번호로 검색..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>

			{/* Students List */}
			<div className="space-y-4">
				{filteredStudents.map((student) => {
					const unreadCount = getUnreadCount(student);
					const lastMessage = getLastMessage(student);

					return (
						<div
							key={student.info.id}
							className="bg-white rounded-lg shadow-sm p-6"
						>
							<div className="flex justify-between items-start">
								<div className="flex-1">
									<div className="flex items-center gap-4 mb-3">
										<div className="flex items-center">
											<h3 className="text-lg font-semibold text-gray-900">
												{student.info.name}
											</h3>
											<span className="ml-2 text-sm text-gray-600">
												({student.info.age}세, {student.info.type})
											</span>
										</div>
										{unreadCount > 0 && (
											<span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
												{unreadCount}
											</span>
										)}
									</div>

									<div className="grid grid-cols-2 gap-4 mb-4">
										<div className="space-y-2">
											<div className="flex items-center text-sm text-gray-600">
												<Phone className="h-4 w-4 mr-2" />
												{student.info.phone}
											</div>
											<div className="flex items-center text-sm text-gray-600">
												<Clock className="h-4 w-4 mr-2" />
												통화 가능: {student.info.availableCallTime}
											</div>
											<div className="flex items-center text-sm text-gray-600">
												<MapPin className="h-4 w-4 mr-2" />
												유입: {student.info.source}
											</div>
										</div>
										<div className="space-y-2">
											<div className="text-sm">
												<span className="font-medium">목표:</span>{" "}
												{student.info.targetUniversity}{" "}
												{student.info.targetMajor}
											</div>
											<div className="text-sm">
												<span className="font-medium">전적:</span>{" "}
												{student.info.previousEducation}
											</div>
											<div className="text-sm">
												<span className="font-medium">계열:</span>{" "}
												{student.info.track}
											</div>
										</div>
									</div>

									{student.info.message && (
										<div className="bg-blue-50 p-3 rounded-lg mb-4">
											<p className="text-sm text-blue-800">
												<span className="font-medium">"</span>
												{student.info.message}
												<span className="font-medium">"</span>
											</p>
										</div>
									)}

									<div className="bg-gray-50 p-3 rounded-lg">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium text-gray-700">
												최근 카카오톡
											</span>
											<span className="text-xs text-gray-500">
												{formatTemporalDateTime(
													student.lastActivity,
													"MM/dd HH:mm",
												)}
											</span>
										</div>
										<p className="text-sm text-gray-600 line-clamp-2">
											{lastMessage}
										</p>
									</div>
								</div>

								<div className="flex flex-col gap-2 ml-6">
									<Link
										to={`/student/${student.info.id}`}
										className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
									>
										상세보기
									</Link>
								</div>
							</div>

							{student.specialNotes && (
								<div className="mt-4 pt-4 border-t border-gray-200">
									<div className="bg-yellow-50 p-3 rounded-lg">
										<div className="flex items-center">
											<span className="text-yellow-600 font-medium text-sm mr-2">
												특이사항:
											</span>
											<span className="text-yellow-800 text-sm">
												{student.specialNotes}
											</span>
										</div>
									</div>
								</div>
							)}
						</div>
					);
				})}

				{filteredStudents.length === 0 && (
					<div className="bg-white rounded-lg shadow-sm p-12 text-center">
						<User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							상담 대기 중인 학생이 없습니다
						</h3>
						<p className="text-gray-600">
							새로운 상담 신청이 들어오면 여기에 표시됩니다.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ConsultationPage;
