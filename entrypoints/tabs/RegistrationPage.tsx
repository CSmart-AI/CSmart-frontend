import {
	Award,
	Bot,
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
import PageSpecificAIManager from "@/components/PageSpecificAIManager";
import { registrationAIResponses } from "@/data/aiResponseData";
import { mockStudents } from "@/data/mockData";
import type { Student } from "@/types/student";
import { formatTemporalDate, formatTemporalDateTime } from "@/utils/temporal";

const RegistrationPage = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState<"students" | "ai">("students");

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
				return "text-green-600 bg-green-100";
			case "대기":
				return "text-yellow-600 bg-yellow-100";
			case "취소":
				return "text-red-600 bg-red-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const pendingAIResponses = registrationAIResponses.filter(
		(r) => r.status === "pending",
	).length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">등록 관리</h1>
						<p className="text-gray-600 mt-1">
							배치고사 및 해설지 배급, 개별 카카오톡 채널 안내
						</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setActiveTab("students")}
								className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
									activeTab === "students"
										? "bg-blue-600 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								<User className="h-4 w-4" />
								학생 관리
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("ai")}
								className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 relative ${
									activeTab === "ai"
										? "bg-blue-600 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								<Bot className="h-4 w-4" />
								AI 응답 관리
								{pendingAIResponses > 0 && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
										{pendingAIResponses}
									</span>
								)}
							</button>
						</div>
						<div className="text-right">
							<div className="text-3xl font-bold text-green-600">
								{registrationStudents.length}
							</div>
							<div className="text-sm text-gray-600">등록 진행 중</div>
						</div>
					</div>
				</div>
			</div>

			{/* Conditional Content */}
			{activeTab === "ai" ? (
				<PageSpecificAIManager
					responses={registrationAIResponses}
					pageType="registration"
					title="등록 AI 응답 관리"
					description="배치고사 안내 및 등록 관련 문의에 대한 AI 자동응답을 관리합니다"
				/>
			) : (
				<>
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
									<div className="flex justify-between items-start mb-6">
										<div className="flex items-center gap-4">
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
										<div className="flex gap-2">
											<Link
												to={`/student/${student.info.id}`}
												className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
											>
												상세보기
											</Link>
										</div>
									</div>

									<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
										{/* Payment Information */}
										<div className="bg-blue-50 p-4 rounded-lg">
											<div className="flex items-center mb-3">
												<CreditCard className="h-5 w-5 text-blue-600 mr-2" />
												<h4 className="font-medium text-blue-900">결제 정보</h4>
											</div>
											{student.payment ? (
												<div className="space-y-2">
													<div className="flex justify-between items-center">
														<span className="text-sm text-gray-600">상태:</span>
														<span
															className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
																student.payment.status,
															)}`}
														>
															{student.payment.status}
														</span>
													</div>
													<div className="flex justify-between items-center">
														<span className="text-sm text-gray-600">금액:</span>
														<span className="text-sm font-medium">
															{student.payment.amount.toLocaleString()}원
														</span>
													</div>
													<div className="flex justify-between items-center">
														<span className="text-sm text-gray-600">방법:</span>
														<span className="text-sm">
															{student.payment.method}
														</span>
													</div>
													<div className="flex justify-between items-center">
														<span className="text-sm text-gray-600">과정:</span>
														<span className="text-sm">
															{student.payment.course}
														</span>
													</div>
													<div className="flex justify-between items-center">
														<span className="text-sm text-gray-600">일시:</span>
														<span className="text-sm">
															{formatTemporalDate(
																student.payment.paymentDate,
																"MM/dd",
															)}
														</span>
													</div>
												</div>
											) : (
												<div className="text-sm text-gray-500">
													결제 정보 없음
												</div>
											)}
										</div>

										{/* Placement Test */}
										<div className="bg-green-50 p-4 rounded-lg">
											<div className="flex items-center mb-3">
												<Calculator className="h-5 w-5 text-green-600 mr-2" />
												<h4 className="font-medium text-green-900">배치고사</h4>
											</div>
											{student.placementTest ? (
												<div className="space-y-2">
													<div className="flex justify-between items-center">
														<span className="text-sm text-gray-600">총점:</span>
														<span className="text-sm font-medium text-green-700">
															{student.placementTest.totalScore}/300
														</span>
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
														<span className="text-sm text-gray-600">
															응시일:
														</span>
														<span className="text-sm">
															{formatTemporalDate(
																student.placementTest.testDate,
																"MM/dd",
															)}
														</span>
													</div>
													<div className="flex justify-between items-center">
														<span className="text-sm text-gray-600">
															해설지:
														</span>
														<div className="flex items-center">
															{student.placementTest.explanationProvided ? (
																<>
																	<CheckCircle className="h-4 w-4 text-green-500 mr-1" />
																	<span className="text-sm text-green-600">
																		배급완료
																	</span>
																</>
															) : (
																<>
																	<XCircle className="h-4 w-4 text-red-500 mr-1" />
																	<span className="text-sm text-red-600">
																		미배급
																	</span>
																</>
															)}
														</div>
													</div>
												</div>
											) : (
												<div className="space-y-2">
													<div className="flex items-center text-yellow-600">
														<Clock className="h-4 w-4 mr-1" />
														<span className="text-sm">배치고사 대기</span>
													</div>
													<button
														type="button"
														className="w-full bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
													>
														배치고사 일정 안내
													</button>
												</div>
											)}
										</div>

										{/* Progress Status */}
										<div className="bg-purple-50 p-4 rounded-lg">
											<div className="flex items-center mb-3">
												<Award className="h-5 w-5 text-purple-600 mr-2" />
												<h4 className="font-medium text-purple-900">
													진행 상황
												</h4>
											</div>
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<span className="text-sm text-gray-600">결제</span>
													{student.payment?.status === "완료" ? (
														<CheckCircle className="h-4 w-4 text-green-500" />
													) : (
														<Clock className="h-4 w-4 text-yellow-500" />
													)}
												</div>
												<div className="flex items-center justify-between">
													<span className="text-sm text-gray-600">
														배치고사
													</span>
													{student.placementTest ? (
														<CheckCircle className="h-4 w-4 text-green-500" />
													) : (
														<Clock className="h-4 w-4 text-yellow-500" />
													)}
												</div>
												<div className="flex items-center justify-between">
													<span className="text-sm text-gray-600">해설지</span>
													{student.placementTest?.explanationProvided ? (
														<CheckCircle className="h-4 w-4 text-green-500" />
													) : (
														<Clock className="h-4 w-4 text-yellow-500" />
													)}
												</div>
												<div className="flex items-center justify-between">
													<span className="text-sm text-gray-600">
														개별채널
													</span>
													<Clock className="h-4 w-4 text-yellow-500" />
												</div>
												<button
													type="button"
													className="w-full bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors mt-3"
												>
													개별 채널 안내(??)
												</button>
											</div>
										</div>
									</div>

									{/* Recent Message */}
									<div className="mt-6 bg-gray-50 p-4 rounded-lg">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium text-gray-700 flex items-center">
												<MessageCircle className="h-4 w-4 mr-2" />
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

									{student.specialNotes && (
										<div className="mt-4 bg-yellow-50 p-3 rounded-lg">
											<div className="flex items-center">
												<span className="text-yellow-600 font-medium text-sm mr-2">
													특이사항:
												</span>
												<span className="text-yellow-800 text-sm">
													{student.specialNotes}
												</span>
											</div>
										</div>
									)}
								</div>
							);
						})}

						{filteredStudents.length === 0 && (
							<div className="bg-white rounded-lg shadow-sm p-12 text-center">
								<FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									등록 진행 중인 학생이 없습니다
								</h3>
								<p className="text-gray-600">
									상담이 완료되어 등록 중인 학생들이 여기에 표시됩니다.
								</p>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default RegistrationPage;
