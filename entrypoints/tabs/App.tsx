import { useEffect, useState } from "react";
import { Navigate, Route, HashRouter as Router, Routes } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout.tsx";
import TeacherLayout from "../../components/TeacherLayout.tsx";
import { authStorage, type UserRole } from "../../utils/auth";
import AIManagementPage from "./AIManagementPage.tsx";
import CalendarPage from "./CalendarPage.tsx";
import ConsultationPage from "./ConsultationPage.tsx";
import KakaoLoginPage from "./KakaoLoginPage.tsx";
import ManagementPage from "./ManagementPage.tsx";
import RegistrationPage from "./RegistrationPage.tsx";
import StudentDetailPage from "./StudentDetailPage.tsx";
import TeacherManagementPage from "./TeacherManagementPage.tsx";

function App() {
	const [authState, setAuthState] = useState<{
		isAuthenticated: boolean;
		role: UserRole | null;
	}>({
		isAuthenticated: false,
		role: null,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadAuthState = async () => {
			const state = await authStorage.get();
			setAuthState({
				isAuthenticated: state.isAuthenticated,
				role: state.role,
			});
			setLoading(false);
		};

		loadAuthState();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-gray-600">로딩 중...</div>
			</div>
		);
	}

	// 인증되지 않은 경우 로그인 페이지로 리다이렉트
	if (!authState.isAuthenticated) {
		return (
			<Router>
				<Routes>
					<Route path="*" element={<Navigate to="/login" replace />} />
				</Routes>
			</Router>
		);
	}

	// 관리자 라우트
	if (authState.role === "admin") {
		return (
			<Router>
				<AdminLayout>
					<Routes>
						<Route path="/" element={<Navigate to="/consultation" replace />} />
						<Route path="/login/kakao" element={<KakaoLoginPage />} />
						<Route path="/consultation" element={<ConsultationPage />} />
						<Route path="/registration" element={<RegistrationPage />} />
						<Route path="/management" element={<ManagementPage />} />
						<Route path="/calendar" element={<CalendarPage />} />
						<Route path="/ai-management" element={<AIManagementPage />} />
						<Route path="/teacher-management" element={<TeacherManagementPage />} />
						<Route path="/student/:id" element={<StudentDetailPage />} />
						<Route path="*" element={<Navigate to="/consultation" replace />} />
					</Routes>
				</AdminLayout>
			</Router>
		);
	}

	// 선생님 라우트
	if (authState.role === "teacher") {
		return (
			<Router>
				<TeacherLayout>
					<Routes>
						<Route path="/" element={<Navigate to="/ai-management" replace />} />
						<Route path="/login/kakao" element={<KakaoLoginPage />} />
						<Route path="/ai-management" element={<AIManagementPage />} />
						<Route path="*" element={<Navigate to="/ai-management" replace />} />
					</Routes>
				</TeacherLayout>
			</Router>
		);
	}

	return null;
}

export default App;
