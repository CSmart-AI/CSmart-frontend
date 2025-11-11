import { useState } from "react";
import { browser } from "wxt/browser";
import { authStorage, type UserRole } from "@/utils/auth";
import "./App.css";

/**
 * 로그인 팝업 컴포넌트
 * 관리자/선생님 선택 후 이메일과 비밀번호로 로그인
 */
function App() {
	const [userRole, setUserRole] = useState<UserRole | null>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	/**
	 * 로그인 폼 제출 처리
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// 입력값 검증
		if (!userRole) {
			setError("관리자 또는 선생님을 선택해주세요.");
			return;
		}

		if (!email.trim() || !password.trim()) {
			setError("이메일과 비밀번호를 모두 입력해주세요.");
			return;
		}

		setLoading(true);

		try {
			// TODO: 실제 API 연동 전까지 임시로 모든 입력을 통과시킴
			// API 호출 대신 임시 토큰과 사용자 정보 생성
			await new Promise((resolve) => setTimeout(resolve, 500));

			// 임시 인증 상태 저장
			await authStorage.set({
				isAuthenticated: true,
				role: userRole,
				accessToken: "temp_access_token",
				refreshToken: "temp_refresh_token",
				memberId: userRole === "admin" ? 1 : 2,
				name: userRole === "admin" ? "관리자" : "선생님",
				email: email,
				teacherId: userRole === "teacher" ? 2 : null,
			});

			// 로그인 후 /login/kakao로 리다이렉트 (API는 아직 없지만 경로는 생성)
			browser.tabs.create({
				url: browser.runtime.getURL("/tabs.html#/login/kakao"),
			});

			// 팝업 닫기
			window.close();
		} catch (error) {
			setError(
				`로그인 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
			);
			setLoading(false);
		}
	};

	return (
		<div className="login-container">
			<div className="login-header">
				<h1>CSmart</h1>
				<p>로그인 유형을 선택하고 로그인하세요</p>
			</div>

			<form onSubmit={handleSubmit} className="login-form">
				{/* Role Selection */}
				<div className="input-group">
					<div className="role-selection">
						<button
							type="button"
							onClick={() => setUserRole("admin")}
							className={`role-button ${userRole === "admin" ? "active" : ""}`}
							disabled={loading}
						>
							관리자
						</button>
						<button
							type="button"
							onClick={() => setUserRole("teacher")}
							className={`role-button ${userRole === "teacher" ? "active" : ""}`}
							disabled={loading}
						>
							선생님
						</button>
					</div>
				</div>

				<div className="input-group">
					<input
						type="email"
						placeholder="이메일"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={loading}
					/>
				</div>

				<div className="input-group">
					<input
						type="password"
						placeholder="비밀번호"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={loading}
					/>
				</div>

				{error && <div className="error-message">{error}</div>}

				<button type="submit" className="login-button" disabled={loading}>
					{loading ? "로그인 중..." : "로그인"}
				</button>
			</form>
		</div>
	);
}

export default App;
