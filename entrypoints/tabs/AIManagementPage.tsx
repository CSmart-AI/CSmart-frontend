import { FileText, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import PageSpecificAIManager from "@/components/PageSpecificAIManager";
import { Badge, Typography } from "@/components/ui";
import {
	consultationAIResponses,
	managementAIResponses,
	registrationAIResponses,
} from "@/data/aiResponseData";
import { cn } from "@/utils/cn";

type PageType = "consultation" | "registration" | "management";

const AIManagementPage = () => {
	const [activePageType, setActivePageType] =
		useState<PageType>("consultation");

	const getPageConfig = (pageType: PageType) => {
		switch (pageType) {
			case "consultation":
				return {
					responses: consultationAIResponses,
					title: "상담 AI 응답 관리",
					description:
						"전화상담 예약 및 상담 문의에 대한 AI 자동응답을 관리합니다",
					icon: Phone,
				};
			case "registration":
				return {
					responses: registrationAIResponses,
					title: "등록 AI 응답 관리",
					description:
						"배치고사 안내 및 등록 관련 문의에 대한 AI 자동응답을 관리합니다",
					icon: FileText,
				};
			case "management":
				return {
					responses: managementAIResponses,
					title: "관리 AI 응답 관리",
					description:
						"편입 일정 문의 및 학습 관련 질문에 대한 AI 자동응답을 관리합니다",
					icon: MessageCircle,
				};
		}
	};

	const getPendingCount = (pageType: PageType) => {
		const config = getPageConfig(pageType);
		return config.responses.filter((r) => r.status === "pending").length;
	};

	const getTotalCount = (pageType: PageType) => {
		const config = getPageConfig(pageType);
		return config.responses.length;
	};

	const getSentCount = (pageType: PageType) => {
		const config = getPageConfig(pageType);
		return config.responses.filter((r) => r.status === "sent").length;
	};

	const pageConfig = getPageConfig(activePageType);

	const pageTypes: Array<{
		type: PageType;
		label: string;
		icon: typeof Phone;
	}> = [
		{ type: "consultation", label: "상담", icon: Phone },
		{ type: "registration", label: "등록", icon: FileText },
		{ type: "management", label: "관리", icon: MessageCircle },
	];

	return (
		<div className="flex min-h-[calc(100vh-var(--header-height))]">
			{/* Sidebar Navigation - Linear Style */}
			<aside className="w-64 border-r border-[rgba(255,255,255,0.05)] bg-[var(--color-dark)] flex-shrink-0 flex flex-col">
				{/* Sidebar Header */}
				<div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
					<Typography variant="h3" className="flex items-center gap-2 mb-1">
						AI 응답 관리
					</Typography>
					<Typography
						variant="small"
						className="text-[var(--color-text-secondary)]"
					>
						모든 페이지의 AI 자동응답을 한 곳에서 관리합니다
					</Typography>
				</div>

				{/* Navigation Items */}
				<nav className="flex-1 p-3">
					<div className="space-y-1">
						{pageTypes.map(({ type, label, icon: Icon }) => {
							const isActive = activePageType === type;
							const pendingCount = getPendingCount(type);

							return (
								<button
									key={type}
									type="button"
									onClick={() => setActivePageType(type)}
									className={cn(
										"w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-100 text-left group",
										isActive
											? "bg-[var(--color-primary)]/20 text-[var(--color-text-primary)]"
											: "text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--color-text-primary)]",
									)}
								>
									<div className="flex items-center gap-2.5">
										<Icon
											className={cn(
												"h-4 w-4",
												isActive
													? "text-[var(--color-primary)]"
													: "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]",
											)}
										/>
										<Typography variant="small" className="font-medium">
											{label}
										</Typography>
									</div>
									{pendingCount > 0 && (
										<Badge
											variant="danger"
											className="h-5 min-w-5 flex items-center justify-center px-1.5 text-[10px] font-semibold"
										>
											{pendingCount}
										</Badge>
									)}
								</button>
							);
						})}
					</div>
				</nav>

				{/* Sidebar Footer Stats */}
				<div className="p-4 border-t border-[rgba(255,255,255,0.05)] space-y-3">
					<div className="flex items-center justify-between">
						<Typography
							variant="small"
							className="text-[var(--color-text-secondary)]"
						>
							총 응답
						</Typography>
						<Typography variant="small" className="font-semibold">
							{getTotalCount(activePageType)}
						</Typography>
					</div>
					<div className="flex items-center justify-between">
						<Typography
							variant="small"
							className="text-[var(--color-text-secondary)]"
						>
							승인 대기
						</Typography>
						<Typography
							variant="small"
							className="font-semibold text-[var(--color-yellow)]"
						>
							{getPendingCount(activePageType)}
						</Typography>
					</div>
					<div className="flex items-center justify-between">
						<Typography
							variant="small"
							className="text-[var(--color-text-secondary)]"
						>
							발송 완료
						</Typography>
						<Typography
							variant="small"
							className="font-semibold text-[var(--color-green)]"
						>
							{getSentCount(activePageType)}
						</Typography>
					</div>
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 bg-[var(--color-background)]">
				<div className="w-full px-[var(--page-padding-inline)] py-6">
					{/* Page Header */}
					<div className="mb-4">
						<div className="flex items-center gap-2">
							<pageConfig.icon className="h-5 w-5 text-[var(--color-primary)]" />
							<Typography variant="h3">{pageConfig.title}</Typography>
						</div>
					</div>

					{/* AI Manager Content */}
					<PageSpecificAIManager
						responses={pageConfig.responses}
						pageType={activePageType}
						title={pageConfig.title}
						description={pageConfig.description}
					/>
				</div>
			</main>
		</div>
	);
};

export default AIManagementPage;
