import {
	Bot,
	Calendar,
	GraduationCap,
	Settings,
	UserPlus,
	Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import { Typography } from "./ui";

interface AdminLayoutProps {
	children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
	const location = useLocation();

	const navItems = [
		{
			path: "/consultation",
			label: "상담",
			icon: UserPlus,
			description: "신규 학생 상담 관리",
		},
		{
			path: "/registration",
			label: "등록",
			icon: GraduationCap,
			description: "등록 중인 학생 관리",
		},
		{
			path: "/management",
			label: "관리",
			icon: Users,
			description: "수강 중인 학생 관리",
		},
		{
			path: "/calendar",
			label: "일정",
			icon: Calendar,
			description: "상담 및 특별 일정 관리",
		},
		{
			path: "/ai-management",
			label: "AI 응답",
			icon: Bot,
			description: "AI 자동응답 관리",
		},
		{
			path: "/teacher-management",
			label: "선생님 관리",
			icon: Settings,
			description: "선생님 채널 관리",
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b border-gray-200 backdrop-blur-[20px] sticky top-0 z-[var(--layer-header)]">
				<div className="w-full px-[var(--page-padding-inline)]">
					<div className="flex items-center justify-between h-[var(--header-height)]">
						<div className="flex items-center gap-3">
							<Settings className="h-8 w-8 text-[var(--color-primary)]" />
							<Typography variant="h4" as="h1" className="text-gray-900">
								CSmart
							</Typography>
						</div>
						{/* Navigation */}
						<nav className="flex-1 flex justify-center">
							<ul className="flex items-center gap-1">
								{navItems.map((item) => {
									const Icon = item.icon;
									const isActive = location.pathname === item.path;

									return (
										<li key={item.path}>
											<Link
												to={item.path}
												className={cn(
													"flex items-center gap-2 px-4 py-2 rounded-[var(--radius-medium)] transition-all duration-100",
													isActive
														? "bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30"
														: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
												)}
												title={item.description}
											>
												<Icon className="h-4 w-4 shrink-0" />
												<span className="font-medium text-sm">
													{item.label}
												</span>
											</Link>
										</li>
									);
								})}
							</ul>
						</nav>
						<div className="flex items-center gap-4">
							<span className="text-sm text-gray-600">
								관리자
							</span>
							<div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
								<span className="text-white text-sm font-medium">관</span>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="w-full px-[var(--page-padding-inline)] py-8">
				{children}
			</main>
		</div>
	);
};

export default AdminLayout;
