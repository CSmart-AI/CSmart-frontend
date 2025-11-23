import {
	AlertTriangle,
	Bot,
	CheckCircle,
	Clock,
	Edit3,
	Filter,
	MessageCircle,
	Search,
	Send,
	TrendingUp,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { formatTemporalDateTime, toJSDate } from "@/utils/temporal";
import { mockAIResponses } from "../data/aiResponseData";
import { mockStudents } from "../data/mockData";
import type { AIResponse } from "../types/student";
import { Badge, Button, Card, Typography } from "./ui";

const AIResponseManager = () => {
	const [selectedTab, setSelectedTab] = useState<"pending" | "all">("pending");
	const [filterCategory, setFilterCategory] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [editingResponse, setEditingResponse] = useState<string | null>(null);
	const [editedText, setEditedText] = useState("");

	const filteredResponses = mockAIResponses
		.filter((response) => {
			if (selectedTab === "pending" && response.status !== "pending")
				return false;
			if (filterCategory !== "all" && response.category !== filterCategory)
				return false;
			if (searchTerm) {
				const student = mockStudents.find(
					(s) => s.info.id === response.studentId,
				);
				const studentName = student?.info.name || "";
				return (
					response.originalMessage
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					response.suggestedResponse
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					studentName.toLowerCase().includes(searchTerm.toLowerCase())
				);
			}
			return true;
		})
		.sort(
			(a, b) =>
				toJSDate(b.createdAt).getTime() - toJSDate(a.createdAt).getTime(),
		);

	const pendingCount = mockAIResponses.filter(
		(r) => r.status === "pending",
	).length;
	const autoSentCount = mockAIResponses.filter(
		(r) => r.isAutoSent && r.status === "sent",
	).length;
	const approvedCount = mockAIResponses.filter(
		(r) => r.status === "approved",
	).length;

	const getStudentName = (studentId: string) => {
		const student = mockStudents.find((s) => s.info.id === studentId);
		return student?.info.name || "알 수 없음";
	};

	const getCategoryInfo = (category: string) => {
		const categories = {
			faq: {
				label: "FAQ",
				variant: "primary" as const,
				icon: MessageCircle,
			},
			consultation: {
				label: "상담",
				variant: "success" as const,
				icon: MessageCircle,
			},
			complaint: {
				label: "불만",
				variant: "danger" as const,
				icon: AlertTriangle,
			},
			schedule: {
				label: "일정",
				variant: "primary" as const,
				icon: Clock,
			},
			payment: {
				label: "결제",
				variant: "warning" as const,
				icon: TrendingUp,
			},
			other: {
				label: "기타",
				variant: "default" as const,
				icon: MessageCircle,
			},
		};
		return categories[category as keyof typeof categories] || categories.other;
	};

	const getStatusIcon = (response: AIResponse) => {
		switch (response.status) {
			case "sent":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "approved":
				return <Send className="h-4 w-4 text-blue-500" />;
			case "rejected":
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return <Clock className="h-4 w-4 text-yellow-500" />;
		}
	};

	const handleApprove = (responseId: string) => {
		console.log("Approving response:", responseId);
		// 실제 구현에서는 API 호출
	};

	const handleReject = (responseId: string) => {
		console.log("Rejecting response:", responseId);
		// 실제 구현에서는 API 호출
	};

	const handleEdit = (responseId: string, currentText: string) => {
		setEditingResponse(responseId);
		setEditedText(currentText);
	};

	const handleSaveEdit = (responseId: string) => {
		console.log("Saving edited response:", responseId, editedText);
		setEditingResponse(null);
		setEditedText("");
		// 실제 구현에서는 API 호출
	};

	const handleSendApproved = (responseId: string) => {
		console.log("Sending approved response:", responseId);
		// 실제 구현에서는 API 호출
	};

	return (
		<div className="w-full space-y-6">
			{/* Header & Stats */}
			<Card padding="lg">
				<div className="flex justify-between items-center mb-6">
					<div>
						<Typography variant="h3" className="flex items-center gap-2 mb-2">
							<Bot className="h-6 w-6 text-[var(--color-primary)]" />
							AI 자동응답 관리
						</Typography>
						<Typography
							variant="body"
							className="text-[var(--color-text-secondary)]"
						>
							AI가 분석한 카카오톡 메시지와 추천 응답을 관리합니다
						</Typography>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card
						padding="md"
						className="bg-[var(--color-yellow)]/10 border-[var(--color-yellow)]/20"
					>
						<div className="flex items-center">
							<Clock className="h-8 w-8 text-[var(--color-yellow)]" />
							<div className="ml-3">
								<div className="text-2xl font-bold text-[var(--color-yellow)]">
									{pendingCount}
								</div>
								<Typography
									variant="small"
									className="text-[var(--color-text-secondary)]"
								>
									승인 대기
								</Typography>
							</div>
						</div>
					</Card>

					<Card
						padding="md"
						className="bg-[var(--color-green)]/10 border-[var(--color-green)]/20"
					>
						<div className="flex items-center">
							<Bot className="h-8 w-8 text-[var(--color-green)]" />
							<div className="ml-3">
								<div className="text-2xl font-bold text-[var(--color-green)]">
									{autoSentCount}
								</div>
								<Typography
									variant="small"
									className="text-[var(--color-text-secondary)]"
								>
									자동 발송
								</Typography>
							</div>
						</div>
					</Card>

					<Card
						padding="md"
						className="bg-[var(--color-blue)]/10 border-[var(--color-blue)]/20"
					>
						<div className="flex items-center">
							<CheckCircle className="h-8 w-8 text-[var(--color-blue)]" />
							<div className="ml-3">
								<div className="text-2xl font-bold text-[var(--color-blue)]">
									{approvedCount}
								</div>
								<Typography
									variant="small"
									className="text-[var(--color-text-secondary)]"
								>
									승인 완료
								</Typography>
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
								<div className="text-2xl font-bold text-[var(--color-primary)]">
									{Math.round((autoSentCount / mockAIResponses.length) * 100)}%
								</div>
								<Typography
									variant="small"
									className="text-[var(--color-text-secondary)]"
								>
									자동화율
								</Typography>
							</div>
						</div>
					</Card>
				</div>
			</Card>

			{/* Filters & Search */}
			<Card padding="md">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex gap-2">
						<Button
							variant={selectedTab === "pending" ? "primary" : "secondary"}
							size="md"
							onClick={() => setSelectedTab("pending")}
							className={cn(
								selectedTab === "pending" &&
									"bg-[var(--color-primary)] text-white",
							)}
						>
							승인 대기 ({pendingCount})
						</Button>
						<Button
							variant={selectedTab === "all" ? "primary" : "secondary"}
							size="md"
							onClick={() => setSelectedTab("all")}
							className={cn(
								selectedTab === "all" && "bg-[var(--color-primary)] text-white",
							)}
						>
							전체 응답
						</Button>
					</div>

					<div className="flex gap-4 flex-1">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] h-4 w-4" />
							<input
								type="text"
								placeholder="메시지 내용 또는 학생명으로 검색..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-9 pr-4 py-2 bg-[var(--color-dark)] border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-medium)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-[var(--color-text-secondary)]" />
							<select
								value={filterCategory}
								onChange={(e) => setFilterCategory(e.target.value)}
								className="bg-[var(--color-dark)] border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-medium)] px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
							>
								<option value="all">전체 카테고리</option>
								<option value="faq">FAQ</option>
								<option value="consultation">상담</option>
								<option value="complaint">불만</option>
								<option value="schedule">일정</option>
								<option value="payment">결제</option>
								<option value="other">기타</option>
							</select>
						</div>
					</div>
				</div>
			</Card>

			{/* AI Responses List */}
			<div className="space-y-4">
				{filteredResponses.map((response) => {
					const categoryInfo = getCategoryInfo(response.category);
					const CategoryIcon = categoryInfo.icon;
					const studentName = getStudentName(response.studentId);

					return (
						<Card key={response.id} padding="lg">
							<div className="flex justify-between items-start mb-4">
								<div className="flex items-center gap-3 flex-wrap">
									<div className="flex items-center gap-2">
										{getStatusIcon(response)}
										<Typography variant="body" className="font-medium">
											{studentName}
										</Typography>
									</div>
									<Badge variant={categoryInfo.variant}>
										<CategoryIcon className="h-3 w-3 inline mr-1" />
										{categoryInfo.label}
									</Badge>
									<Badge
										variant={
											response.confidence >= 0.8
												? "success"
												: response.confidence >= 0.6
													? "warning"
													: "danger"
										}
									>
										신뢰도 {Math.round(response.confidence * 100)}%
									</Badge>
									{response.isAutoSent && (
										<Badge variant="success">자동발송</Badge>
									)}
								</div>
								<Typography
									variant="small"
									className="text-[var(--color-text-secondary)]"
								>
									{formatTemporalDateTime(response.createdAt, "MM/dd HH:mm")}
								</Typography>
							</div>

							{/* Original Message */}
							<div className="mb-4">
								<Typography variant="body" className="font-medium mb-2">
									원본 메시지:
								</Typography>
								<Card padding="md" className="bg-[var(--color-dark)]/50">
									<Typography
										variant="body"
										className="text-[var(--color-text-primary)] whitespace-pre-wrap"
									>
										{response.originalMessage}
									</Typography>
								</Card>
							</div>

							{/* Suggested Response */}
							<div className="mb-4">
								<div className="flex items-center gap-2 mb-2">
									<Typography variant="body" className="font-medium">
										AI 추천 응답:
									</Typography>
									{response.status === "pending" && (
										<button
											type="button"
											onClick={() =>
												handleEdit(response.id, response.suggestedResponse)
											}
											className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors"
										>
											<Edit3 className="h-4 w-4" />
										</button>
									)}
								</div>
								{editingResponse === response.id ? (
									<div className="space-y-3">
										<textarea
											value={editedText}
											onChange={(e) => setEditedText(e.target.value)}
											className="w-full p-3 bg-[var(--color-dark)] border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-medium)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
											rows={4}
										/>
										<div className="flex gap-2">
											<Button
												variant="primary"
												size="sm"
												onClick={() => handleSaveEdit(response.id)}
											>
												저장
											</Button>
											<Button
												variant="secondary"
												size="sm"
												onClick={() => setEditingResponse(null)}
											>
												취소
											</Button>
										</div>
									</div>
								) : (
									<Card
										padding="md"
										className="bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20"
									>
										<Typography
											variant="body"
											className="text-[var(--color-text-primary)] whitespace-pre-wrap"
										>
											{response.suggestedResponse}
										</Typography>
									</Card>
								)}
							</div>

							{/* Actions */}
							<div className="flex justify-between items-center">
								<Typography
									variant="small"
									className="text-[var(--color-text-secondary)]"
								>
									{response.status === "sent" && response.sentAt && (
										<span>
											발송됨:{" "}
											{formatTemporalDateTime(response.sentAt, "MM/dd HH:mm")}
										</span>
									)}
									{response.status === "approved" && response.approvedAt && (
										<span>
											승인됨:{" "}
											{formatTemporalDateTime(
												response.approvedAt,
												"MM/dd HH:mm",
											)}
										</span>
									)}
									{response.approvedBy && (
										<span className="ml-2">by {response.approvedBy}</span>
									)}
								</Typography>

								<div className="flex gap-2">
									{response.status === "pending" && (
										<>
											<Button
												variant="danger"
												size="sm"
												onClick={() => handleReject(response.id)}
											>
												<XCircle className="h-4 w-4 mr-1" />
												거절
											</Button>
											<Button
												variant="primary"
												size="sm"
												onClick={() => handleApprove(response.id)}
												className="bg-[var(--color-green)] hover:opacity-90"
											>
												<CheckCircle className="h-4 w-4 mr-1" />
												승인
											</Button>
										</>
									)}
									{response.status === "approved" && (
										<Button
											variant="primary"
											size="sm"
											onClick={() => handleSendApproved(response.id)}
										>
											<Send className="h-4 w-4 mr-1" />
											발송
										</Button>
									)}
								</div>
							</div>
						</Card>
					);
				})}

				{filteredResponses.length === 0 && (
					<Card padding="lg" className="text-center">
						<Bot className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
						<Typography variant="h4" className="mb-2">
							{selectedTab === "pending"
								? "승인 대기 중인 응답이 없습니다"
								: "응답이 없습니다"}
						</Typography>
						<Typography
							variant="body"
							className="text-[var(--color-text-secondary)]"
						>
							{selectedTab === "pending"
								? "새로운 메시지가 들어오면 AI가 자동으로 분석하여 여기에 표시됩니다."
								: "검색 조건을 변경해보세요."}
						</Typography>
					</Card>
				)}
			</div>
		</div>
	);
};

export default AIResponseManager;
