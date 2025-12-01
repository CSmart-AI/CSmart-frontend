import { useState } from "react";
import { browser } from "wxt/browser";
import { authApi, teacherApi } from "@/utils/api";
import type { UserRole } from "@/utils/auth";
import { authStorage } from "@/utils/auth";
import "./App.css";

/**
 * 카카오 로그인 팝업 컴포넌트
 * 카카오 계정 아이디와 비밀번호로 로그인 (역할은 API에서 자동 확인)
 */
function App() {
	const [kakaoId, setKakaoId] = useState("");
	const [kakaoPassword, setKakaoPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	/**
	 * 카카오 로그인 폼 제출 처리
	 */
	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// 입력값 검증
		if (!kakaoId.trim() || !kakaoPassword.trim()) {
			setError("카카오 계정 아이디와 비밀번호를 모두 입력해주세요.");
			return;
		}

		setLoading(true);

		try {
			// 먼저 선생님 목록 조회
			try {
				const teachersResponse = await teacherApi.getAll();

				if (teachersResponse.isSuccess && teachersResponse.result) {
					// 입력한 kakaoId를 email로 간주하고 일치하는 선생님 찾기
					const matchedTeacher = teachersResponse.result.find(
						(teacher) => teacher.email === kakaoId.trim(),
					);

					if (matchedTeacher) {
						// 이메일이 일치하는 선생님이 있으면 기존 관리자 auth 정보를 가져와서 teacherId만 추가
						const existingAuth = await authStorage.get();

						// 기존 관리자 auth 정보가 없으면 에러
						if (!existingAuth.isAuthenticated || !existingAuth.accessToken) {
							setError("먼저 관리자로 로그인해주세요.");
							return;
						}

						// 기존 관리자 auth 정보에 teacherId만 추가
						await authStorage.set({
							...existingAuth,
							teacherId: matchedTeacher.teacherId,
						});

						// 선생님 페이지로 리다이렉트 (/:teacherId 형식)
						const redirectUrl = browser.runtime.getURL(
							`/tabs.html#/${matchedTeacher.teacherId}/ai-management`,
						);
						browser.tabs.create({ url: redirectUrl });
						window.close();
						return;
					}
				}
			} catch (teacherError) {
				// 선생님 목록 조회 실패 시 에러 로그만 남기고 카카오 로그인으로 진행
				console.error("선생님 목록 조회 실패:", teacherError);
			}

			// 선생님 목록에 없으면 기존 카카오 로그인 진행
			const response = await authApi.kakaoLogin({
				kakaoId: kakaoId.trim(),
				kakaoPassword: kakaoPassword.trim(),
			});

			if (response.isSuccess && response.result) {
				const {
					userId,
					role,
					email: userEmail,
					name: userName,
					accessToken,
					refreshToken,
				} = response.result;

				// 백엔드에서 반환하는 role을 소문자로 변환 (ADMIN -> admin, TEACHER -> teacher)
				const normalizedRole: UserRole = role === "ADMIN" ? "admin" : "teacher";

				// 인증 상태 저장
				await authStorage.set({
					isAuthenticated: true,
					role: normalizedRole,
					accessToken,
					refreshToken,
					memberId: userId,
					name: userName,
					email: userEmail,
					teacherId: normalizedRole === "teacher" ? userId : null,
				});

				// 역할에 따라 페이지 리다이렉트
				const redirectUrl =
					normalizedRole === "admin"
						? browser.runtime.getURL("/tabs.html#/management")
						: browser.runtime.getURL(`/tabs.html#/${userId}/ai-management`);

				browser.tabs.create({ url: redirectUrl });
				window.close();
			} else {
				setError(response.message || "로그인에 실패했습니다.");
			}
		} catch (error) {
			setError(
				`로그인 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-header">
				<h1>CSmart</h1>
				<p>카카오 계정으로 로그인하세요</p>
			</div>

			<form onSubmit={handleLogin} className="auth-form">
				<div className="input-group">
					<input
						type="text"
						placeholder="카카오 계정 아이디"
						value={kakaoId}
						onChange={(e) => setKakaoId(e.target.value)}
						disabled={loading}
						required
					/>
				</div>

				<div className="input-group">
					<input
						type="password"
						placeholder="카카오 계정 비밀번호"
						value={kakaoPassword}
						onChange={(e) => setKakaoPassword(e.target.value)}
						disabled={loading}
						required
					/>
				</div>

				{error && <div className="error-message">{error}</div>}

				<button type="submit" className="auth-button" disabled={loading}>
					{loading ? "로그인 중..." : "로그인"}
				</button>
			</form>
		</div>
	);
}

export default App;
