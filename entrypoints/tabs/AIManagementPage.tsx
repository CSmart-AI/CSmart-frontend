import { Bot, FileText, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import PageSpecificAIManager from "@/components/PageSpecificAIManager";
import {
	consultationAIResponses,
	managementAIResponses,
	registrationAIResponses,
} from "@/data/aiResponseData";

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

	const pageConfig = getPageConfig(activePageType);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
							<Bot className="h-6 w-6 text-blue-600" />
							AI 응답 관리
						</h1>
						<p className="text-gray-600 mt-1">
							모든 페이지의 AI 자동응답을 한 곳에서 관리합니다
						</p>
					</div>
				</div>

				{/* Page Type Tabs */}
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setActivePageType("consultation")}
						className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 relative ${
							activePageType === "consultation"
								? "bg-blue-600 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						<Phone className="h-4 w-4" />
						상담
						{getPendingCount("consultation") > 0 && (
							<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
								{getPendingCount("consultation")}
							</span>
						)}
					</button>
					<button
						type="button"
						onClick={() => setActivePageType("registration")}
						className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 relative ${
							activePageType === "registration"
								? "bg-blue-600 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						<FileText className="h-4 w-4" />
						등록
						{getPendingCount("registration") > 0 && (
							<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
								{getPendingCount("registration")}
							</span>
						)}
					</button>
					<button
						type="button"
						onClick={() => setActivePageType("management")}
						className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 relative ${
							activePageType === "management"
								? "bg-blue-600 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						<MessageCircle className="h-4 w-4" />
						관리
						{getPendingCount("management") > 0 && (
							<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
								{getPendingCount("management")}
							</span>
						)}
					</button>
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
	);
};

export default AIManagementPage;
