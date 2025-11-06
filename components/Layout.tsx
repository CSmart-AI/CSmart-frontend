import {
	Calendar,
	GraduationCap,
	Settings,
	UserPlus,
	Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
	children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<Settings className="h-8 w-8 text-blue-600" />
							<h1 className="ml-3 text-xl font-bold text-gray-900">CSmart</h1>
						</div>
						<div className="flex items-center space-x-4">
							<span className="text-sm text-gray-600">관리자</span>
							<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
								<span className="text-white text-sm font-medium">관</span>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex gap-8">
					{/* Sidebar Navigation */}
					<nav className="w-64 shrink-0">
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h2 className="text-lg font-semibold text-gray-900 mb-4">메뉴</h2>
							<ul className="space-y-2">
								{navItems.map((item) => {
									const Icon = item.icon;
									const isActive = location.pathname === item.path;

									return (
										<li key={item.path}>
											<Link
												to={item.path}
												className={`flex items-center p-3 rounded-lg transition-colors ${
													isActive
														? "bg-blue-50 text-blue-700 border border-blue-200"
														: "text-gray-700 hover:bg-gray-50"
												}`}
											>
												<Icon className="h-5 w-5 mr-3" />
												<div>
													<div className="font-medium">{item.label}</div>
													<div className="text-xs text-gray-500 mt-1">
														{item.description}
													</div>
												</div>
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					</nav>

					{/* Main Content */}
					<main className="flex-1">{children}</main>
				</div>
			</div>
		</div>
	);
};

export default Layout;
