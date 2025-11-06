import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle,
	Clock,
	CreditCard,
	Edit3,
	GraduationCap,
	MapPin,
	MessageCircle,
	Phone,
	Save,
	Send,
	Trophy,
	User,
	X,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mockStudents } from "@/data/mockData";
import { formatTemporalDate, formatTemporalDateTime } from "@/utils/temporal";

const StudentDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const [newMessage, setNewMessage] = useState("");
	const [isEditingNotes, setIsEditingNotes] = useState(false);
	const [editedNotes, setEditedNotes] = useState("");

	const student = mockStudents.find((s) => s.info.id === id);

	if (!student) {
		return (
			<div className="bg-white rounded-lg shadow-sm p-12 text-center">
				<User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					학생을 찾을 수 없습니다
				</h3>
				<Link
					to="/management"
					className="text-blue-600 hover:text-blue-700 font-medium"
				>
					관리 페이지로 돌아가기
				</Link>
			</div>
		);
	}

	const handleSendMessage = () => {
		if (newMessage.trim()) {
			// In a real app, this would send the message to the server
			console.log("Sending message:", newMessage);
			setNewMessage("");
		}
	};

	const handleEditNotes = () => {
		setEditedNotes(student.specialNotes);
		setIsEditingNotes(true);
	};

	const handleSaveNotes = () => {
		// In a real app, this would save to the server
		console.log("Saving notes:", editedNotes);
		setIsEditingNotes(false);
	};

	const handleCancelEdit = () => {
		setIsEditingNotes(false);
		setEditedNotes("");
	};

	const getStatusBadge = (status: string) => {
		const badges = {
			consultation: { label: "상담", color: "bg-yellow-100 text-yellow-800" },
			registration: { label: "등록", color: "bg-blue-100 text-blue-800" },
			management: { label: "관리", color: "bg-green-100 text-green-800" },
		};
		const badge = badges[status as keyof typeof badges];
		return (
			<span
				className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
			>
				{badge.label}
			</span>
		);
	};

	const getScoreGrade = (score?: number) => {
		if (!score) return { grade: "N/A", color: "text-gray-400" };
		if (score >= 250) return { grade: "A", color: "text-green-600" };
		if (score >= 200) return { grade: "B", color: "text-blue-600" };
		if (score >= 150) return { grade: "C", color: "text-yellow-600" };
		return { grade: "D", color: "text-red-600" };
	};

	const scoreGrade = getScoreGrade(student.placementTest?.totalScore);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-4">
						<Link
							to="/management"
							className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<ArrowLeft className="h-5 w-5 text-gray-600" />
						</Link>
						<div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
							{student.info.name[0]}
						</div>
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								{student.info.name}
							</h1>
							<p className="text-gray-600">
								{student.info.age}세 · {student.info.type} ·{" "}
								{student.info.track}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						{getStatusBadge(student.status)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Student Information */}
				<div className="lg:col-span-2 space-y-6">
					{/* Basic Info */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<User className="h-5 w-5 mr-2" />
							기본 정보
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="name"
									className="text-sm font-medium text-gray-700"
								>
									성함
								</label>
								<p className="text-gray-900">{student.info.name}</p>
							</div>
							<div>
								<label
									htmlFor="age"
									className="text-sm font-medium text-gray-700"
								>
									나이
								</label>
								<p className="text-gray-900">{student.info.age}세</p>
							</div>
							<div>
								<label
									htmlFor="type"
									className="text-sm font-medium text-gray-700"
								>
									구분
								</label>
								<p className="text-gray-900">{student.info.type}</p>
							</div>
							<div>
								<label
									htmlFor="track"
									className="text-sm font-medium text-gray-700"
								>
									계열
								</label>
								<p className="text-gray-900">{student.info.track}</p>
							</div>
							<div>
								<label
									htmlFor="phone"
									className="text-sm font-medium text-gray-700"
								>
									전화번호
								</label>
								<p className="text-gray-900 flex items-center">
									<Phone className="h-4 w-4 mr-2" />
									{student.info.phone}
								</p>
							</div>
							<div>
								<label
									htmlFor="availableCallTime"
									className="text-sm font-medium text-gray-700"
								>
									통화 가능 시간
								</label>
								<p className="text-gray-900 flex items-center">
									<Clock className="h-4 w-4 mr-2" />
									{student.info.availableCallTime}
								</p>
							</div>
							<div>
								<label
									htmlFor="source"
									className="text-sm font-medium text-gray-700"
								>
									유입경로
								</label>
								<p className="text-gray-900 flex items-center">
									<MapPin className="h-4 w-4 mr-2" />
									{student.info.source}
								</p>
							</div>
							<div>
								<label
									htmlFor="createdAt"
									className="text-sm font-medium text-gray-700"
								>
									등록일
								</label>
								<p className="text-gray-900 flex items-center">
									<Calendar className="h-4 w-4 mr-2" />
									{formatTemporalDate(
										student.info.createdAt,
										"yyyy년 MM월 dd일",
									)}
								</p>
							</div>
						</div>
					</div>

					{/* Academic Info */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<GraduationCap className="h-5 w-5 mr-2" />
							학력 정보
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="previousEducation"
									className="text-sm font-medium text-gray-700"
								>
									전적대/학과
								</label>
								<p className="text-gray-900">
									{student.info.previousEducation}
								</p>
							</div>
							<div>
								<label
									htmlFor="targetUniversity"
									className="text-sm font-medium text-gray-700"
								>
									목표대학/학과
								</label>
								<p className="text-gray-900">
									{student.info.targetUniversity} {student.info.targetMajor}
								</p>
							</div>
							<div>
								<label
									htmlFor="mathGrade"
									className="text-sm font-medium text-gray-700"
								>
									수능 수학 등급
								</label>
								<p className="text-gray-900">
									{student.info.mathGrade || "N/A"}
								</p>
							</div>
							<div>
								<label
									htmlFor="englishGrade"
									className="text-sm font-medium text-gray-700"
								>
									수능 영어 등급
								</label>
								<p className="text-gray-900">
									{student.info.englishGrade || "N/A"}
								</p>
							</div>
							<div>
								<label
									htmlFor="previousCourse"
									className="text-sm font-medium text-gray-700"
								>
									이전 수강 경험
								</label>
								<p className="text-gray-900">{student.info.previousCourse}</p>
							</div>
							<div className="md:col-span-2">
								<label
									htmlFor="additionalInfo"
									className="text-sm font-medium text-gray-700"
								>
									추가 정보
								</label>
								<div className="flex flex-wrap gap-2 mt-1">
									{student.info.isRetaking && (
										<span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
											편입재수
										</span>
									)}
									{student.info.isSunungRetaking && (
										<span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
											수능재수
										</span>
									)}
									{student.info.hasToeic && (
										<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
											토익 보유
										</span>
									)}
									{student.info.hasPartTimeJob && (
										<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
											알바 중
										</span>
									)}
								</div>
							</div>
						</div>
						{student.info.message && (
							<div className="mt-4 p-4 bg-blue-50 rounded-lg">
								<label
									htmlFor="message"
									className="text-sm font-medium text-blue-900"
								>
									학생 메시지
								</label>
								<p className="text-blue-800 mt-1">"{student.info.message}"</p>
							</div>
						)}
					</div>

					{/* Placement Test & Payment */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Placement Test */}
						{student.placementTest && (
							<div className="bg-white rounded-lg shadow-sm p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
									<Trophy className="h-5 w-5 mr-2" />
									배치고사 결과
								</h2>
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-gray-600">총점</span>
										<div className="flex items-center gap-2">
											<span className="text-lg font-bold">
												{student.placementTest.totalScore}/300
											</span>
											<span
												className={`font-bold px-2 py-1 rounded text-sm ${scoreGrade.color} bg-gray-100`}
											>
												{scoreGrade.grade}
											</span>
										</div>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">수학</span>
										<span className="font-medium">
											{student.placementTest.mathScore}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">영어</span>
										<span className="font-medium">
											{student.placementTest.englishScore}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">국어</span>
										<span className="font-medium">
											{student.placementTest.koreanScore}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">응시일</span>
										<span className="text-sm">
											{formatTemporalDate(
												student.placementTest.testDate,
												"MM/dd",
											)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-600">해설지</span>
										{student.placementTest.explanationProvided ? (
											<span className="text-green-600 flex items-center text-sm">
												<CheckCircle className="h-4 w-4 mr-1" />
												배급완료
											</span>
										) : (
											<span className="text-red-600 flex items-center text-sm">
												<AlertCircle className="h-4 w-4 mr-1" />
												미배급
											</span>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Payment Info */}
						{student.payment && (
							<div className="bg-white rounded-lg shadow-sm p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
									<CreditCard className="h-5 w-5 mr-2" />
									결제 정보
								</h2>
								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-gray-600">과정</span>
										<span className="font-medium">
											{student.payment.course}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">금액</span>
										<span className="font-medium">
											{student.payment.amount.toLocaleString()}원
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">결제방법</span>
										<span className="font-medium">
											{student.payment.method}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">결제일</span>
										<span className="text-sm">
											{formatTemporalDate(student.payment.paymentDate, "MM/dd")}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-600">상태</span>
										<span
											className={`px-2 py-1 rounded text-sm font-medium ${
												student.payment.status === "완료"
													? "bg-green-100 text-green-800"
													: student.payment.status === "대기"
														? "bg-yellow-100 text-yellow-800"
														: "bg-red-100 text-red-800"
											}`}
										>
											{student.payment.status}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Special Notes */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-gray-900 flex items-center">
								<AlertCircle className="h-5 w-5 mr-2" />
								특이사항
							</h2>
							{!isEditingNotes && (
								<button
									type="button"
									onClick={handleEditNotes}
									className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
								>
									<Edit3 className="h-4 w-4" />
									수정
								</button>
							)}
						</div>
						{isEditingNotes ? (
							<div className="space-y-4">
								<textarea
									value={editedNotes}
									onChange={(e) => setEditedNotes(e.target.value)}
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									rows={4}
									placeholder="특이사항을 입력하세요..."
								/>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={handleSaveNotes}
										className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
									>
										<Save className="h-4 w-4" />
										저장
									</button>
									<button
										type="button"
										onClick={handleCancelEdit}
										className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
									>
										<X className="h-4 w-4" />
										취소
									</button>
								</div>
							</div>
						) : (
							<p className="text-gray-700">
								{student.specialNotes || "특이사항이 없습니다."}
							</p>
						)}
					</div>
				</div>

				{/* Chat Section */}
				<div className="bg-white rounded-lg shadow-sm p-6 h-fit">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<MessageCircle className="h-5 w-5 mr-2" />
						카카오톡 대화
					</h2>

					{/* Messages */}
					<div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
						{student.kakaoMessages.map((message) => (
							<div
								key={message.id}
								className={`flex ${
									message.sender === "admin" ? "justify-end" : "justify-start"
								}`}
							>
								<div
									className={`max-w-xs px-4 py-2 rounded-lg ${
										message.sender === "admin"
											? "bg-blue-500 text-white"
											: "bg-gray-200 text-gray-900"
									}`}
								>
									<p className="text-sm">{message.message}</p>
									<p
										className={`text-xs mt-1 ${
											message.sender === "admin"
												? "text-blue-100"
												: "text-gray-500"
										}`}
									>
										{formatTemporalDateTime(message.timestamp, "MM/dd HH:mm")}
									</p>
								</div>
							</div>
						))}
					</div>

					{/* Message Input */}
					<div className="border-t pt-4">
						<div className="flex gap-2">
							<input
								type="text"
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								placeholder="메시지를 입력하세요..."
								className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
							/>
							<button
								type="button"
								onClick={handleSendMessage}
								className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
							>
								<Send className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StudentDetailPage;
