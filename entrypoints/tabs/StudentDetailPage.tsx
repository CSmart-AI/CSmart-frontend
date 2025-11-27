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
import { Badge, Button, Card, Typography } from "@/components/ui";
import { mockStudents } from "@/data/mockData";
import { cn } from "@/utils/cn";
import { formatTemporalDate, formatTemporalDateTime } from "@/utils/temporal";

const StudentDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const [newMessage, setNewMessage] = useState("");
	const [isEditingNotes, setIsEditingNotes] = useState(false);
	const [editedNotes, setEditedNotes] = useState("");

	const student = mockStudents.find((s) => s.info.id === id);

	if (!student) {
		return (
			<Card padding="lg" className="text-center">
				<User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
				<Typography variant="h3" className="mb-2">
					학생을 찾을 수 없습니다
				</Typography>
				<Link
					to="/management"
					className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium"
				>
					관리 페이지로 돌아가기
				</Link>
			</Card>
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
			consultation: { label: "상담", variant: "warning" as const },
			registration: { label: "등록", variant: "primary" as const },
			management: { label: "관리", variant: "success" as const },
		};
		const badge = badges[status as keyof typeof badges];
		return <Badge variant={badge.variant}>{badge.label}</Badge>;
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

	const scoreGrade = getScoreGrade(student.placementTest?.totalScore);

	return (
		<div className="flex min-h-[calc(100vh-var(--header-height))]">
			{/* Main Content Area */}
			<main className="flex-1 bg-gray-50">
				<div className="w-full px-[var(--page-padding-inline)] py-6">
					{/* Page Header */}
					<div className="mb-6">
						<Card padding="lg">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-4">
									<Link
										to="/management"
										className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
									>
										<ArrowLeft className="h-5 w-5 text-gray-600" />
									</Link>
									<div>
										<Typography variant="h2">{student.info.name}</Typography>
										<Typography variant="body-secondary">
											{student.info.age}세 · {student.info.type} ·{" "}
											{student.info.track}
										</Typography>
									</div>
								</div>
								<div className="flex items-center gap-3">
									{getStatusBadge(student.status)}
								</div>
							</div>
						</Card>
					</div>

					<div className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Student Information */}
							<div className="lg:col-span-2 space-y-6">
								{/* Basic Info */}
								<Card padding="lg">
									<Typography variant="h3" className="mb-4 flex items-center">
										<User className="h-5 w-5 mr-2" />
										기본 정보
									</Typography>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Typography variant="small" className="font-medium mb-1">
												성함
											</Typography>
											<Typography variant="body">
												{student.info.name}
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												나이
											</Typography>
											<Typography variant="body">
												{student.info.age}세
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												구분
											</Typography>
											<Typography variant="body">
												{student.info.type}
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												계열
											</Typography>
											<Typography variant="body">
												{student.info.track}
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												전화번호
											</Typography>
											<Typography variant="body" className="flex items-center">
												<Phone className="h-4 w-4 mr-2" />
												{student.info.phone}
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												통화 가능 시간
											</Typography>
											<Typography variant="body" className="flex items-center">
												<Clock className="h-4 w-4 mr-2" />
												{student.info.availableCallTime}
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												유입경로
											</Typography>
											<Typography variant="body" className="flex items-center">
												<MapPin className="h-4 w-4 mr-2" />
												{student.info.source}
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												등록일
											</Typography>
											<Typography variant="body" className="flex items-center">
												<Calendar className="h-4 w-4 mr-2" />
												{formatTemporalDate(
													student.info.createdAt,
													"yyyy년 MM월 dd일",
												)}
											</Typography>
										</div>
									</div>
								</Card>

								{/* Academic Info */}
								<Card padding="lg">
									<Typography variant="h3" className="mb-4 flex items-center">
										<GraduationCap className="h-5 w-5 mr-2" />
										학력 정보
									</Typography>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Typography variant="small" className="font-medium mb-1">
												전적대/학과
											</Typography>
											<Typography variant="body">
												{student.info.previousEducation}
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												목표대학/학과
											</Typography>
											<Typography variant="body">
												{student.info.targetUniversity}{" "}
												{student.info.targetMajor}
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												수능 수학 등급
											</Typography>
											<Typography variant="body">
												{student.info.mathGrade || "N/A"}
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												수능 영어 등급
											</Typography>
											<Typography variant="body">
												{student.info.englishGrade || "N/A"}
											</Typography>
										</div>
										<div>
											<Typography variant="small" className="font-medium mb-1">
												이전 수강 경험
											</Typography>
											<Typography variant="body">
												{student.info.previousCourse}
											</Typography>
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
													<Badge variant="warning">편입재수</Badge>
												)}
												{student.info.isSunungRetaking && (
													<Badge variant="danger">수능재수</Badge>
												)}
												{student.info.hasToeic && (
													<Badge variant="success">토익 보유</Badge>
												)}
												{student.info.hasPartTimeJob && (
													<Badge variant="primary">알바 중</Badge>
												)}
											</div>
										</div>
									</div>
									{student.info.message && (
										<Card
											padding="md"
											className="mt-4 bg-[var(--color-primary)]/10 border border-gray-200"
										>
											<Typography
												variant="small"
												className="font-medium text-[var(--color-primary)] mb-1"
											>
												학생 메시지
											</Typography>
											<Typography
												variant="body-secondary"
												className="text-[var(--color-primary)]"
											>
												"{student.info.message}"
											</Typography>
										</Card>
									)}
								</Card>

								{/* Placement Test & Payment */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Placement Test */}
									{student.placementTest && (
										<Card padding="lg">
											<Typography
												variant="h3"
												className="mb-4 flex items-center"
											>
												<Trophy className="h-5 w-5 mr-2" />
												배치고사 결과
											</Typography>
											<div className="space-y-3">
												<div className="flex justify-between items-center">
													<Typography variant="body-secondary">총점</Typography>
													<div className="flex items-center gap-2">
														<Typography variant="h3">
															{student.placementTest.totalScore}/300
														</Typography>
														<Badge
															variant="default"
															className={cn("text-sm", scoreGrade.color)}
														>
															{scoreGrade.grade}
														</Badge>
													</div>
												</div>
												<div className="flex justify-between">
													<Typography variant="body-secondary">수학</Typography>
													<Typography variant="small" className="font-medium">
														{student.placementTest.mathScore}
													</Typography>
												</div>
												<div className="flex justify-between">
													<Typography variant="body-secondary">영어</Typography>
													<Typography variant="small" className="font-medium">
														{student.placementTest.englishScore}
													</Typography>
												</div>
												<div className="flex justify-between">
													<Typography variant="body-secondary">국어</Typography>
													<Typography variant="small" className="font-medium">
														{student.placementTest.koreanScore}
													</Typography>
												</div>
												<div className="flex justify-between">
													<Typography variant="body-secondary">
														응시일
													</Typography>
													<Typography variant="small">
														{formatTemporalDate(
															student.placementTest.testDate,
															"MM/dd",
														)}
													</Typography>
												</div>
												<div className="flex justify-between items-center">
													<Typography variant="body-secondary">
														해설지
													</Typography>
													{student.placementTest.explanationProvided ? (
														<span className="text-[var(--color-green)] flex items-center text-sm">
															<CheckCircle className="h-4 w-4 mr-1" />
															배급완료
														</span>
													) : (
														<span className="text-[var(--color-red)] flex items-center text-sm">
															<AlertCircle className="h-4 w-4 mr-1" />
															미배급
														</span>
													)}
												</div>
											</div>
										</Card>
									)}

									{/* Payment Info */}
									{student.payment && (
										<Card padding="lg">
											<Typography
												variant="h3"
												className="mb-4 flex items-center"
											>
												<CreditCard className="h-5 w-5 mr-2" />
												결제 정보
											</Typography>
											<div className="space-y-3">
												<div className="flex justify-between">
													<Typography variant="body-secondary">과정</Typography>
													<Typography variant="small" className="font-medium">
														{student.payment.course}
													</Typography>
												</div>
												<div className="flex justify-between">
													<Typography variant="body-secondary">금액</Typography>
													<Typography variant="small" className="font-medium">
														{student.payment.amount.toLocaleString()}원
													</Typography>
												</div>
												<div className="flex justify-between">
													<Typography variant="body-secondary">
														결제방법
													</Typography>
													<Typography variant="small" className="font-medium">
														{student.payment.method}
													</Typography>
												</div>
												<div className="flex justify-between">
													<Typography variant="body-secondary">
														결제일
													</Typography>
													<Typography variant="small">
														{formatTemporalDate(
															student.payment.paymentDate,
															"MM/dd",
														)}
													</Typography>
												</div>
												<div className="flex justify-between items-center">
													<Typography variant="body-secondary">상태</Typography>
													<Badge
														variant={
															student.payment.status === "완료"
																? "success"
																: student.payment.status === "대기"
																	? "warning"
																	: "danger"
														}
													>
														{student.payment.status}
													</Badge>
												</div>
											</div>
										</Card>
									)}
								</div>

								{/* Special Notes */}
								<Card padding="lg">
									<div className="flex items-center justify-between mb-4">
										<Typography variant="h3" className="flex items-center">
											<AlertCircle className="h-5 w-5 mr-2" />
											특이사항
										</Typography>
										{!isEditingNotes && (
											<Button
												variant="ghost"
												size="sm"
												onClick={handleEditNotes}
											>
												<Edit3 className="h-4 w-4 mr-1" />
												수정
											</Button>
										)}
									</div>
									{isEditingNotes ? (
										<div className="space-y-4">
											<textarea
												value={editedNotes}
												onChange={(e) => setEditedNotes(e.target.value)}
												className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)] focus:border-transparent"
												rows={4}
												placeholder="특이사항을 입력하세요..."
											/>
											<div className="flex gap-2">
												<Button onClick={handleSaveNotes}>
													<Save className="h-4 w-4 mr-2" />
													저장
												</Button>
												<Button variant="ghost" onClick={handleCancelEdit}>
													<X className="h-4 w-4 mr-2" />
													취소
												</Button>
											</div>
										</div>
									) : (
										<Typography variant="body">
											{student.specialNotes || "특이사항이 없습니다."}
										</Typography>
									)}
								</Card>
							</div>

							{/* Chat Section */}
							<Card padding="lg" className="h-fit">
								<Typography variant="h3" className="mb-4 flex items-center">
									<MessageCircle className="h-5 w-5 mr-2" />
									카카오톡 대화
								</Typography>

								{/* Messages */}
								<div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
									{student.kakaoMessages.map((message) => (
										<div
											key={message.id}
											className={`flex ${
												message.sender === "admin"
													? "justify-end"
													: "justify-start"
											}`}
										>
											<div
												className={cn(
													"max-w-xs px-4 py-2.5 rounded-2xl border shadow-sm",
													message.sender === "admin"
														? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]/20"
														: "bg-gray-100 text-gray-900 border-gray-200",
												)}
											>
												<Typography
													variant="small"
													className={cn(
														message.sender === "admin"
															? "text-white"
															: "text-gray-900",
													)}
												>
													{message.message}
												</Typography>
												<Typography
													variant="small"
													className={cn(
														"text-xs mt-1.5",
														message.sender === "admin"
															? "text-white/80"
															: "text-gray-500",
													)}
												>
													{formatTemporalDateTime(
														message.timestamp,
														"MM/dd HH:mm",
													)}
												</Typography>
											</div>
										</div>
									))}
								</div>
							</Card>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default StudentDetailPage;
