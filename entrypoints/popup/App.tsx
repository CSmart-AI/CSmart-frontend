import { useState } from "react";
import { browser } from "wxt/browser";
import { authStorage } from "@/utils/auth";
import "./App.css";

/**
 * 로그인 팝업 컴포넌트
 * 이메일과 비밀번호로 로그인 (계정 타입은 API에서 자동 확인)
 */
function App() {
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
		if (!email.trim() || !password.trim()) {
			setError("이메일과 비밀번호를 모두 입력해주세요.");
			return;
		}

		setLoading(true);

		try {
			// 임시로 선생님 인증 상태 저장 (개발용 - 아무 입력이나 하면 선생님으로 로그인)
			await authStorage.set({
				isAuthenticated: true,
				role: "teacher",
				accessToken: "temp_access_token",
				refreshToken: "temp_refresh_token",
				memberId: 2,
				name: "선생님",
				email: email.trim() || "teacher@example.com",
				teacherId: 2,
			});

			// 선생님 페이지로 리다이렉트
			browser.tabs.create({
				url: browser.runtime.getURL("/tabs.html#/ai-management"),
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
				<p>이메일과 비밀번호로 로그인하세요</p>
			</div>

			<form onSubmit={handleSubmit} className="login-form">
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
