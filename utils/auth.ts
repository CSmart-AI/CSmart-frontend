import { browser } from "wxt/browser";
import { authApi } from "./api";

export type UserRole = "admin" | "teacher";

export interface AuthState {
	isAuthenticated: boolean;
	role: UserRole | null;
	accessToken: string | null;
	refreshToken: string | null;
	memberId: number | null;
	name: string | null;
	email: string | null;
	teacherId?: number | null;
}

const STORAGE_KEYS = {
	AUTH_STATE: "authState",
	ACCESS_TOKEN: "accessToken",
	REFRESH_TOKEN: "refreshToken",
} as const;

export const authStorage = {
	get: async (): Promise<AuthState> => {
		if (browser?.storage) {
			const result = await browser.storage.local.get(STORAGE_KEYS.AUTH_STATE);
			return (
				result[STORAGE_KEYS.AUTH_STATE] || {
					isAuthenticated: false,
					role: null,
					accessToken: null,
					refreshToken: null,
					memberId: null,
					name: null,
					email: null,
					teacherId: null,
				}
			);
		}
		return {
			isAuthenticated: false,
			role: null,
			accessToken: null,
			refreshToken: null,
			memberId: null,
			name: null,
			email: null,
			teacherId: null,
		};
	},

	set: async (state: AuthState): Promise<void> => {
		if (browser?.storage) {
			await browser.storage.local.set({
				[STORAGE_KEYS.AUTH_STATE]: state,
				[STORAGE_KEYS.ACCESS_TOKEN]: state.accessToken,
				[STORAGE_KEYS.REFRESH_TOKEN]: state.refreshToken,
			});
		}
	},

	clear: async (): Promise<void> => {
		if (browser?.storage) {
			await browser.storage.local.remove([
				STORAGE_KEYS.AUTH_STATE,
				STORAGE_KEYS.ACCESS_TOKEN,
				STORAGE_KEYS.REFRESH_TOKEN,
			]);
		}
	},
};

/**
 * Refresh token을 사용하여 새로운 access token과 refresh token을 받아옵니다
 */
export const refreshAccessToken = async (): Promise<boolean> => {
	try {
		const authState = await authStorage.get();
		if (!authState.refreshToken) {
			console.warn("Refresh token이 없습니다.");
			return false;
		}

		const response = await authApi.refreshToken(authState.refreshToken);

		if (response.isSuccess && response.result) {
			// 새로운 토큰으로 auth state 업데이트
			const updatedState: AuthState = {
				...authState,
				accessToken: response.result.accessToken,
				refreshToken: response.result.refreshToken,
			};

			await authStorage.set(updatedState);
			console.log("토큰이 성공적으로 갱신되었습니다.");
			return true;
		}

		console.error("토큰 갱신 실패:", response.message);
		return false;
	} catch (error) {
		console.error("토큰 갱신 중 오류 발생:", error);
		return false;
	}
};

/**
 * 1분마다 자동으로 refresh token을 받아오는 interval을 시작합니다
 * @returns interval을 정리하는 함수
 */
export const startTokenRefreshInterval = (): (() => void) => {
	// 즉시 한 번 실행
	refreshAccessToken();

	// 1분(60000ms)마다 실행
	const intervalId = setInterval(() => {
		refreshAccessToken().catch((error) => {
			console.error("자동 토큰 갱신 실패:", error);
		});
	}, 60000); // 1분 = 60000ms

	// interval을 정리하는 함수 반환
	return () => {
		clearInterval(intervalId);
	};
};
