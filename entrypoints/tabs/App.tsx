import { useEffect, useState } from "react";
import {
	Navigate,
	Route,
	HashRouter as Router,
	Routes,
	useParams,
} from "react-router-dom";
import AdminLayout from "../../components/AdminLayout.tsx";
import TeacherLayout from "../../components/TeacherLayout.tsx";
import { Typography } from "../../components/ui";
import { authStorage, type UserRole } from "../../utils/auth";
import AIManagementPage from "./AIManagementPage.tsx";
import CalendarPage from "./CalendarPage.tsx";
import ConsultationPage from "./ConsultationPage.tsx";
import KakaoLoginPage from "./KakaoLoginPage.tsx";
import ManagementPage from "./ManagementPage.tsx";
import RegistrationPage from "./RegistrationPage.tsx";
import StudentDetailPage from "./StudentDetailPage.tsx";
import TeacherManagementPage from "./TeacherManagementPage.tsx";

// 선생님 메인 페이지 리다이렉트 컴포넌트
function TeacherRedirect() {
	const { teacherId } = useParams<{ teacherId: string }>();
	return <Navigate to={`/${teacherId}/ai-management`} replace />;
}

function App() {
	const [authState, setAuthState] = useState<{
		isAuthenticated: boolean;
		role: UserRole | null;
		teacherId: number | null;
	}>({
		isAuthenticated: false,
		role: null,
		teacherId: null,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadAuthState = async () => {
			const state = await authStorage.get();
			setAuthState({
				isAuthenticated: state.isAuthenticated,
				role: state.role,
				teacherId: state.teacherId || null,
			});
			setLoading(false);
		};

		loadAuthState();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Typography variant="body-secondary">로딩 중...</Typography>
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

	return (
		<Router>
			<Routes>
				{/* 관리자 라우트 */}
				{authState.role === "admin" && (
					<>
						<Route path="/" element={<Navigate to="/consultation" replace />} />
						<Route
							path="/consultation"
							element={
								<AdminLayout>
									<ConsultationPage />
								</AdminLayout>
							}
						/>
						<Route
							path="/registration"
							element={
								<AdminLayout>
									<RegistrationPage />
								</AdminLayout>
							}
						/>
						<Route
							path="/management"
							element={
								<AdminLayout>
									<ManagementPage />
								</AdminLayout>
							}
						/>
						<Route
							path="/calendar"
							element={
								<AdminLayout>
									<CalendarPage />
								</AdminLayout>
							}
						/>
						<Route
							path="/ai-management"
							element={
								<AdminLayout>
									<AIManagementPage />
								</AdminLayout>
							}
						/>
						<Route
							path="/teacher-management"
							element={
								<AdminLayout>
									<TeacherManagementPage />
								</AdminLayout>
							}
						/>
						<Route
							path="/student/:id"
							element={
								<AdminLayout>
									<StudentDetailPage />
								</AdminLayout>
							}
						/>
						<Route path="/login/kakao" element={<KakaoLoginPage />} />
						<Route path="*" element={<Navigate to="/consultation" replace />} />
					</>
				)}

				{/* 선생님 라우트 - URL 기반 (/:teacherId 경로) */}
				<Route
					path="/:teacherId"
					element={
						<TeacherLayout>
							<TeacherRedirect />
						</TeacherLayout>
					}
				/>
				<Route
					path="/:teacherId/ai-management"
					element={
						<TeacherLayout>
							<AIManagementPage />
						</TeacherLayout>
					}
				/>
				<Route
					path="/:teacherId/calendar"
					element={
						<TeacherLayout>
							<CalendarPage />
						</TeacherLayout>
					}
				/>
				<Route
					path="/:teacherId/management"
					element={
						<TeacherLayout>
							<ManagementPage />
						</TeacherLayout>
					}
				/>
				<Route
					path="/:teacherId/student/:id"
					element={
						<TeacherLayout>
							<StudentDetailPage />
						</TeacherLayout>
					}
				/>
				<Route path="/:teacherId/login/kakao" element={<KakaoLoginPage />} />

				{/* 선생님 role일 때 자동 리다이렉트 */}
				{authState.role === "teacher" && authState.teacherId && (
					<>
						<Route
							path="/"
							element={<Navigate to={`/${authState.teacherId}`} replace />}
						/>
						<Route
							path="*"
							element={<Navigate to={`/${authState.teacherId}`} replace />}
						/>
					</>
				)}
			</Routes>
		</Router>
	);
}

export default App;
