import {
	AlertTriangle,
	Bot,
	CheckCircle,
	Clock,
	Edit3,
	FileText,
	Filter,
	MessageCircle,
	Phone,
	Search,
	Send,
	TrendingUp,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { formatTemporalDateTime, toJSDate } from "@/utils/temporal";
import { mockStudents } from "../data/mockData";
import type { AIResponse } from "../types/student";

interface PageSpecificAIManagerProps {
	responses: AIResponse[];
	pageType: "consultation" | "registration" | "management";
	title: string;
	description: string;
}

const PageSpecificAIManager = ({
	responses,
	pageType,
	title,
	description,
}: PageSpecificAIManagerProps) => {
	const [selectedTab, setSelectedTab] = useState<"pending" | "sent" | "all">(
		"pending",
	);
	const [filterCategory, setFilterCategory] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [editingResponse, setEditingResponse] = useState<string | null>(null);
	const [editedText, setEditedText] = useState("");

	const filteredResponses = responses
		.filter((response) => {
			if (selectedTab === "pending" && response.status !== "pending")
				return false;
			if (
				selectedTab === "sent" &&
				(!response.isAutoSent || response.status !== "sent")
			)
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

	const pendingCount = responses.filter((r) => r.status === "pending").length;
	const autoSentCount = responses.filter(
		(r) => r.isAutoSent && r.status === "sent",
	).length;
	const approvedCount = responses.filter((r) => r.status === "approved").length;

	const getStudentName = (studentId: string) => {
		const student = mockStudents.find((s) => s.info.id === studentId);
		return student?.info.name || "알 수 없음";
	};

	const getCategoryInfo = (category: string) => {
		const categories = {
			faq: {
				label: "FAQ",
				color: "bg-blue-100 text-blue-800",
				icon: MessageCircle,
			},
			consultation: {
				label: "상담",
				color: "bg-green-100 text-green-800",
				icon: Phone,
			},
			complaint: {
				label: "불만",
				color: "bg-red-100 text-red-800",
				icon: AlertTriangle,
			},
			schedule: {
				label: "일정",
				color: "bg-purple-100 text-purple-800",
				icon: Clock,
			},
			payment: {
				label: "결제",
				color: "bg-yellow-100 text-yellow-800",
				icon: TrendingUp,
			},
			placement_test: {
				label: "배치고사",
				color: "bg-indigo-100 text-indigo-800",
				icon: FileText,
			},
			other: {
				label: "기타",
				color: "bg-gray-100 text-gray-800",
				icon: MessageCircle,
			},
		};
		return categories[category as keyof typeof categories] || categories.other;
	};

	const getConfidenceColor = (confidence: number) => {
		if (confidence >= 0.8) return "text-green-600 bg-green-100";
		if (confidence >= 0.6) return "text-yellow-600 bg-yellow-100";
		return "text-red-600 bg-red-100";
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

	const getPageIcon = () => {
		switch (pageType) {
			case "consultation":
				return Phone;
			case "registration":
				return FileText;
			case "management":
				return MessageCircle;
			default:
				return Bot;
		}
	};

	const handleApprove = (responseId: string) => {
		console.log("Approving response:", responseId);
	};

	const handleReject = (responseId: string) => {
		console.log("Rejecting response:", responseId);
	};

	const handleEdit = (responseId: string, currentText: string) => {
		setEditingResponse(responseId);
		setEditedText(currentText);
	};

	const handleSaveEdit = (responseId: string) => {
		console.log("Saving edited response:", responseId, editedText);
		setEditingResponse(null);
		setEditedText("");
	};

	const handleSendApproved = (responseId: string) => {
		console.log("Sending approved response:", responseId);
	};

	const PageIcon = getPageIcon();

	return (
		<div className="space-y-6">
			{/* Header & Stats */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
							<PageIcon className="h-6 w-6 text-blue-600" />
							{title}
						</h2>
						<p className="text-gray-600 mt-1">{description}</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="bg-yellow-50 p-4 rounded-lg">
						<div className="flex items-center">
							<Clock className="h-8 w-8 text-yellow-600" />
							<div className="ml-3">
								<div className="text-2xl font-bold text-yellow-600">
									{pendingCount}
								</div>
								<div className="text-sm text-yellow-800">승인 대기</div>
							</div>
						</div>
					</div>

					<div className="bg-green-50 p-4 rounded-lg">
						<div className="flex items-center">
							<Bot className="h-8 w-8 text-green-600" />
							<div className="ml-3">
								<div className="text-2xl font-bold text-green-600">
									{autoSentCount}
								</div>
								<div className="text-sm text-green-800">자동 발송</div>
							</div>
						</div>
					</div>

					<div className="bg-blue-50 p-4 rounded-lg">
						<div className="flex items-center">
							<CheckCircle className="h-8 w-8 text-blue-600" />
							<div className="ml-3">
								<div className="text-2xl font-bold text-blue-600">
									{approvedCount}
								</div>
								<div className="text-sm text-blue-800">승인 완료</div>
							</div>
						</div>
					</div>

					<div className="bg-purple-50 p-4 rounded-lg">
						<div className="flex items-center">
							<TrendingUp className="h-8 w-8 text-purple-600" />
							<div className="ml-3">
								<div className="text-2xl font-bold text-purple-600">
									{responses.length > 0
										? Math.round((autoSentCount / responses.length) * 100)
										: 0}
									%
								</div>
								<div className="text-sm text-purple-800">자동화율</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Filters & Search */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex flex-col md:flex-row gap-4 mb-4">
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setSelectedTab("pending")}
							className={`px-4 py-2 rounded-lg font-medium transition-colors ${
								selectedTab === "pending"
									? "bg-blue-600 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							승인 대기 ({pendingCount})
						</button>
						<button
							type="button"
							onClick={() => setSelectedTab("sent")}
							className={`px-4 py-2 rounded-lg font-medium transition-colors ${
								selectedTab === "sent"
									? "bg-blue-600 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							자동 발송 ({autoSentCount})
						</button>
						<button
							type="button"
							onClick={() => setSelectedTab("all")}
							className={`px-4 py-2 rounded-lg font-medium transition-colors ${
								selectedTab === "all"
									? "bg-blue-600 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							전체 응답
						</button>
					</div>

					<div className="flex gap-4 flex-1">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<input
								type="text"
								placeholder="메시지 내용 또는 학생명으로 검색..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-gray-400" />
							<select
								value={filterCategory}
								onChange={(e) => setFilterCategory(e.target.value)}
								className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="all">전체 카테고리</option>
								<option value="faq">FAQ</option>
								<option value="consultation">상담</option>
								<option value="placement_test">배치고사</option>
								<option value="schedule">일정</option>
								<option value="payment">결제</option>
								<option value="other">기타</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* AI Responses List */}
			<div className="space-y-4">
				{filteredResponses.map((response) => {
					const categoryInfo = getCategoryInfo(response.category);
					const CategoryIcon = categoryInfo.icon;
					const studentName = getStudentName(response.studentId);

					return (
						<div
							key={response.id}
							className="bg-white rounded-lg shadow-sm p-6"
						>
							<div className="flex justify-between items-start mb-4">
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2">
										{getStatusIcon(response)}
										<span className="font-medium text-gray-900">
											{studentName}
										</span>
									</div>
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
									>
										<CategoryIcon className="h-3 w-3 inline mr-1" />
										{categoryInfo.label}
									</span>
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
											response.confidence,
										)}`}
									>
										신뢰도 {Math.round(response.confidence * 100)}%
									</span>
									{response.isAutoSent && (
										<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
											자동발송
										</span>
									)}
								</div>
								<div className="text-xs text-gray-500">
									{formatTemporalDateTime(response.createdAt, "MM/dd HH:mm")}
								</div>
							</div>

							{/* Original Message */}
							<div className="mb-4">
								<div className="text-sm font-medium text-gray-700 mb-2">
									원본 메시지:
								</div>
								<div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800">
									{response.originalMessage}
								</div>
							</div>

							{/* Suggested Response */}
							<div className="mb-4">
								<div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
									AI 추천 응답:
									{response.status === "pending" && (
										<button
											type="button"
											onClick={() =>
												handleEdit(response.id, response.suggestedResponse)
											}
											className="text-blue-600 hover:text-blue-700"
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
											className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											rows={4}
										/>
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => handleSaveEdit(response.id)}
												className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
											>
												저장
											</button>
											<button
												type="button"
												onClick={() => setEditingResponse(null)}
												className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
											>
												취소
											</button>
										</div>
									</div>
								) : (
									<div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900 whitespace-pre-wrap">
										{response.suggestedResponse}
									</div>
								)}
							</div>

							{/* Actions */}
							<div className="flex justify-between items-center">
								<div className="text-xs text-gray-500">
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
								</div>

								<div className="flex gap-2">
									{response.status === "pending" && (
										<>
											<button
												type="button"
												onClick={() => handleReject(response.id)}
												className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
											>
												<XCircle className="h-4 w-4" />
												거절
											</button>
											<button
												type="button"
												onClick={() => handleApprove(response.id)}
												className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center gap-1"
											>
												<CheckCircle className="h-4 w-4" />
												승인
											</button>
										</>
									)}
									{response.status === "approved" && (
										<button
											type="button"
											onClick={() => handleSendApproved(response.id)}
											className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
										>
											<Send className="h-4 w-4" />
											발송
										</button>
									)}
								</div>
							</div>
						</div>
					);
				})}

				{filteredResponses.length === 0 && (
					<div className="bg-white rounded-lg shadow-sm p-12 text-center">
						<Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{selectedTab === "pending"
								? "승인 대기 중인 응답이 없습니다"
								: selectedTab === "sent"
									? "자동 발송된 응답이 없습니다"
									: "응답이 없습니다"}
						</h3>
						<p className="text-gray-600">
							{selectedTab === "pending"
								? "새로운 메시지가 들어오면 AI가 자동으로 분석하여 여기에 표시됩니다."
								: selectedTab === "sent"
									? "AI가 자동으로 발송한 메시지들이 여기에 표시됩니다."
									: "검색 조건을 변경해보세요."}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default PageSpecificAIManager;
