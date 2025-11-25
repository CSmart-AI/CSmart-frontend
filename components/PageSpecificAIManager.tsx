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
import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { formatTemporalDateTime, toJSDate } from "@/utils/temporal";
import { mockStudents } from "../data/mockData";
import type { AIResponse } from "../types/student";
import { Badge, Button, Card, Input, Typography } from "./ui";

interface PageSpecificAIManagerProps {
	responses: AIResponse[];
	pageType: "consultation" | "registration" | "management";
	title?: string;
	description?: string;
}

const PageSpecificAIManager = ({ responses }: PageSpecificAIManagerProps) => {
	const [selectedTab, setSelectedTab] = useState<"pending" | "all">("pending");
	const [filterCategory, setFilterCategory] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [editingResponse, setEditingResponse] = useState<string | null>(null);
	const [editedText, setEditedText] = useState("");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const filteredResponses = useMemo(
		() =>
			responses
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
				),
		[responses, selectedTab, filterCategory, searchTerm],
	);

	const pendingCount = responses.filter((r) => r.status === "pending").length;
	const pendingResponses = filteredResponses.filter(
		(r) => r.status === "pending",
	);
	const allSelected =
		pendingResponses.length > 0 &&
		pendingResponses.every((r) => selectedIds.has(r.id));
	const someSelected =
		pendingResponses.some((r) => selectedIds.has(r.id)) && !allSelected;

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
				icon: Phone,
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
			placement_test: {
				label: "배치고사",
				variant: "primary" as const,
				icon: FileText,
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
				return <CheckCircle className="h-4 w-4 text-[var(--color-green)]" />;
			case "approved":
				return <Send className="h-4 w-4 text-[var(--color-primary)]" />;
			case "rejected":
				return <XCircle className="h-4 w-4 text-[var(--color-red)]" />;
			default:
				return <Clock className="h-4 w-4 text-[var(--color-yellow)]" />;
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

	const handleToggleSelect = (id: string) => {
		const newSelected = new Set(selectedIds);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedIds(newSelected);
	};

	const handleSelectAll = () => {
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(pendingResponses.map((r) => r.id)));
		}
	};

	const handleBulkApprove = () => {
		console.log("Bulk approving:", Array.from(selectedIds));
		setSelectedIds(new Set());
	};

	const handleBulkReject = () => {
		console.log("Bulk rejecting:", Array.from(selectedIds));
		setSelectedIds(new Set());
	};

	return (
		<div className="space-y-6">
			{/* Filters & Search - Linear Style */}
			<div className="flex items-center gap-4">
				{/* Tab Buttons */}
				<div className="flex gap-2 border-b border-gray-200 -mb-px">
					<button
						type="button"
						onClick={() => setSelectedTab("pending")}
						className={cn(
							"px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
							selectedTab === "pending"
								? "text-[var(--color-primary)] border-[var(--color-primary)]"
								: "text-gray-600 border-transparent hover:text-gray-900",
						)}
					>
						승인 대기
						{pendingCount > 0 && (
							<Badge
								variant="danger"
								className="ml-2 h-4 min-w-4 flex items-center justify-center px-1 text-[9px]"
							>
								{pendingCount}
							</Badge>
						)}
					</button>
					<button
						type="button"
						onClick={() => setSelectedTab("all")}
						className={cn(
							"px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
							selectedTab === "all"
								? "text-[var(--color-primary)] border-[var(--color-primary)]"
								: "text-gray-600 border-transparent hover:text-gray-900",
						)}
					>
						전체 응답
					</button>
				</div>

				{/* Search */}
				<div className="flex-1 max-w-md">
					<Input
						type="text"
						placeholder="메시지 내용 또는 학생명으로 검색..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						icon={<Search className="h-4 w-4" />}
					/>
				</div>

				{/* Filter */}
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-gray-600" />
					<select
						value={filterCategory}
						onChange={(e) => setFilterCategory(e.target.value)}
						className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)] focus:border-transparent"
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

			{/* Bulk Actions */}
			{selectedTab === "pending" && pendingResponses.length > 0 && (
				<Card
					padding="md"
					className="flex items-center justify-between bg-white border border-gray-200"
				>
					<div className="flex items-center gap-4">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={allSelected}
								ref={(input) => {
									if (input) input.indeterminate = someSelected;
								}}
								onChange={handleSelectAll}
								className="w-4 h-4 rounded border-gray-300 bg-white text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
							/>
							<Typography variant="small" className="font-medium text-gray-900">
								전체 선택 ({selectedIds.size}/{pendingResponses.length})
							</Typography>
						</label>
					</div>
					{selectedIds.size > 0 && (
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleBulkReject}
								className="text-[var(--color-red)] hover:bg-[var(--color-red)]/10"
							>
								<XCircle className="h-4 w-4 mr-1" />
								일괄 거절 ({selectedIds.size})
							</Button>
							<Button
								variant="primary"
								size="sm"
								onClick={handleBulkApprove}
								className="bg-[var(--color-green)] hover:opacity-90"
							>
								<CheckCircle className="h-4 w-4 mr-1" />
								일괄 승인 ({selectedIds.size})
							</Button>
						</div>
					)}
				</Card>
			)}

			{/* Table */}
			<Card
				padding="none"
				className="overflow-x-auto bg-white border border-gray-200"
			>
				<table className="w-full">
					<thead>
						<tr className="border-b border-gray-200 bg-gray-50">
							{selectedTab === "pending" && (
								<th className="px-4 py-3 text-left w-12">
									<input
										type="checkbox"
										checked={allSelected}
										ref={(input) => {
											if (input) input.indeterminate = someSelected;
										}}
										onChange={handleSelectAll}
										className="w-4 h-4 rounded border-gray-300 bg-white text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
									/>
								</th>
							)}
							<th className="px-4 py-3 text-left">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									학생명
								</Typography>
							</th>
							<th className="px-4 py-3 text-left">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									카테고리
								</Typography>
							</th>
							<th className="px-4 py-3 text-left min-w-[350px]">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									원본 메시지
								</Typography>
							</th>
							<th className="px-4 py-3 text-left min-w-[350px]">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									AI 응답
								</Typography>
							</th>
							<th className="px-4 py-3 text-left w-24">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									상태
								</Typography>
							</th>
							<th className="px-4 py-3 text-left w-32">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									시간
								</Typography>
							</th>
							<th className="px-4 py-3 text-right w-32">
								<Typography
									variant="small"
									className="font-medium text-gray-600"
								>
									액션
								</Typography>
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredResponses.map((response) => {
							const categoryInfo = getCategoryInfo(response.category);
							const CategoryIcon = categoryInfo.icon;
							const studentName = getStudentName(response.studentId);
							const isSelected = selectedIds.has(response.id);

							return (
								<tr
									key={response.id}
									className={cn(
										"border-b border-gray-200 hover:bg-gray-50 transition-colors",
										isSelected && "bg-[var(--color-primary)]/5",
									)}
								>
									{selectedTab === "pending" && (
										<td className="px-4 py-3">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => handleToggleSelect(response.id)}
												className="w-4 h-4 rounded border-gray-300 bg-white text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
											/>
										</td>
									)}
									<td className="px-4 py-3">
										<Typography
											variant="small"
											className="font-medium text-gray-900"
										>
											{studentName}
										</Typography>
									</td>
									<td className="px-4 py-3">
										<Badge variant={categoryInfo.variant} className="text-xs">
											<CategoryIcon className="h-3 w-3 inline mr-1" />
											{categoryInfo.label}
										</Badge>
									</td>
									<td className="px-4 py-3">
										<div className="max-w-[350px]">
											<Typography
												variant="body-secondary"
												className="text-sm line-clamp-3 text-gray-700"
											>
												{response.originalMessage}
											</Typography>
										</div>
									</td>
									<td className="px-4 py-3">
										{editingResponse === response.id ? (
											<div className="space-y-2 max-w-[350px]">
												<textarea
													value={editedText}
													onChange={(e) => setEditedText(e.target.value)}
													className="w-full p-2 bg-white border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)]"
													rows={4}
												/>
												<div className="flex gap-1">
													<Button
														size="sm"
														onClick={() => handleSaveEdit(response.id)}
														className="text-xs px-2 py-1"
													>
														저장
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setEditingResponse(null)}
														className="text-xs px-2 py-1"
													>
														취소
													</Button>
												</div>
											</div>
										) : (
											<div className="max-w-[350px]">
												<Typography
													variant="body-secondary"
													className="text-sm line-clamp-3 text-[var(--color-primary)]"
												>
													{response.suggestedResponse}
												</Typography>
												{response.status === "pending" && (
													<button
														type="button"
														onClick={() =>
															handleEdit(
																response.id,
																response.suggestedResponse,
															)
														}
														className="mt-1 text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors"
													>
														<Edit3 className="h-3 w-3" />
													</button>
												)}
											</div>
										)}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center gap-1">
											{getStatusIcon(response)}
											<Typography
												variant="small"
												className="text-xs text-gray-700"
											>
												{response.status === "pending"
													? "대기"
													: response.status === "approved"
														? "승인"
														: response.status === "sent"
															? "발송"
															: "거절"}
											</Typography>
										</div>
									</td>
									<td className="px-4 py-3">
										<Typography
											variant="small"
											className="text-xs text-gray-600"
										>
											{formatTemporalDateTime(
												response.createdAt,
												"MM/dd HH:mm",
											)}
										</Typography>
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-1">
											{response.status === "pending" && (
												<>
													<button
														type="button"
														onClick={() => handleReject(response.id)}
														className="p-1.5 text-[var(--color-red)] hover:bg-[var(--color-red)]/10 rounded transition-colors"
														title="거절"
													>
														<XCircle className="h-4 w-4" />
													</button>
													<button
														type="button"
														onClick={() => handleApprove(response.id)}
														className="p-1.5 text-[var(--color-green)] hover:bg-[var(--color-green)]/10 rounded transition-colors"
														title="승인"
													>
														<CheckCircle className="h-4 w-4" />
													</button>
												</>
											)}
											{response.status === "approved" && (
												<button
													type="button"
													onClick={() => handleSendApproved(response.id)}
													className="p-1.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded transition-colors"
													title="발송"
												>
													<Send className="h-4 w-4" />
												</button>
											)}
										</div>
									</td>
								</tr>
							);
						})}
						{filteredResponses.length === 0 && (
							<tr>
								<td
									colSpan={selectedTab === "pending" ? 8 : 7}
									className="px-4 py-16 text-center"
								>
									<div className="flex flex-col items-center justify-center">
										<Bot className="h-16 w-16 text-gray-300 mb-6" />
										<Typography variant="h3" className="mb-2 text-gray-900">
											{selectedTab === "pending"
												? "승인 대기 중인 응답이 없습니다"
												: "응답이 없습니다"}
										</Typography>
										<Typography
											variant="body-secondary"
											className="text-gray-600 text-center max-w-md"
										>
											{selectedTab === "pending"
												? "새로운 메시지가 들어오면 AI가 자동으로 분석하여 여기에 표시됩니다."
												: "검색 조건을 변경해보세요."}
										</Typography>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</Card>
		</div>
	);
};

export default PageSpecificAIManager;
