import { Bot, Calendar, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import { Typography } from "./ui";

interface TeacherLayoutProps {
	children: ReactNode;
}

const TeacherLayout = ({ children }: TeacherLayoutProps) => {
	const location = useLocation();

	const navItems = [
		{
			path: "/ai-management",
			label: "AI 응답",
			icon: Bot,
			description: "AI 자동응답 관리",
		},
		{
			path: "/calendar",
			label: "일정",
			icon: Calendar,
			description: "상담 및 특별 일정 관리",
		},
		{
			path: "/management",
			label: "학생 관리",
			icon: Users,
			description: "수강 중인 학생 관리",
		},
	];

	return (
		<div className="min-h-screen bg-[var(--color-background)]">
			{/* Header */}
			<header className="bg-[var(--color-dark)] border-b border-[rgba(255,255,255,0.05)] backdrop-blur-[20px] sticky top-0 z-[var(--layer-header)]">
				<div className="w-full px-[var(--page-padding-inline)]">
					<div className="flex items-center justify-between h-[var(--header-height)]">
						<div className="flex items-center gap-3">
							<Bot className="h-8 w-8 text-[var(--color-primary)]" />
							<Typography variant="h4" as="h1">
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
														: "text-[var(--color-text-secondary)] hover:bg-[var(--color-dark)]/50 hover:text-[var(--color-text-primary)]",
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
							<span className="text-sm text-[var(--color-text-secondary)]">
								선생님
							</span>
							<div className="w-8 h-8 bg-[var(--color-green)] rounded-full flex items-center justify-center">
								<span className="text-white text-sm font-medium">선</span>
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

export default TeacherLayout;
