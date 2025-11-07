import { useState } from "react";
import { browser } from "wxt/browser";
import "./App.css";

/**
 * 카카오톡 로그인 팝업 컴포넌트
 * 아이디와 비밀번호를 입력받아 인증 후 메인 앱을 새 탭으로 열기
 */
function App() {
	const [kakaoId, setKakaoId] = useState("");
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
		if (!kakaoId.trim() || !password.trim()) {
			setError("아이디와 비밀번호를 모두 입력해주세요.");
			return;
		}

		setLoading(true);

		try {
			// 여기에 실제 카카오톡 인증 로직을 추가할 수 있습니다
			// 임시로 간단한 검증만 수행
			await new Promise((resolve) => setTimeout(resolve, 500));

			// 로그인 정보를 Chrome storage에 저장
			await browser.storage.local.set({
				isAuthenticated: true,
				kakaoId: kakaoId,
				loginTime: Date.now(),
			});

			// 새 탭에서 메인 앱 열기
			browser.tabs.create({
				url: browser.runtime.getURL("/tabs.html"),
			});

			// 팝업 닫기
			window.close();
		} catch (error) {
			setError(`로그인 중 오류가 발생했습니다: ${error}`);
			setLoading(false);
		}
	};

	return (
		<div className="login-container">
			<div className="login-header">
				<h1>CSmart</h1>
				<p>카카오톡 계정으로 로그인하세요</p>
			</div>

			<form onSubmit={handleSubmit} className="login-form">
				<div className="input-group">
					<input
						type="text"
						placeholder="카카오톡 아이디"
						value={kakaoId}
						onChange={(e) => setKakaoId(e.target.value)}
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
