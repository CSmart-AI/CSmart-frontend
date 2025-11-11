import { browser } from "wxt/browser";

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
		if (typeof browser !== "undefined" && browser.storage) {
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
		if (typeof browser !== "undefined" && browser.storage) {
			await browser.storage.local.set({
				[STORAGE_KEYS.AUTH_STATE]: state,
				[STORAGE_KEYS.ACCESS_TOKEN]: state.accessToken,
				[STORAGE_KEYS.REFRESH_TOKEN]: state.refreshToken,
			});
		}
	},

	clear: async (): Promise<void> => {
		if (typeof browser !== "undefined" && browser.storage) {
			await browser.storage.local.remove([
				STORAGE_KEYS.AUTH_STATE,
				STORAGE_KEYS.ACCESS_TOKEN,
				STORAGE_KEYS.REFRESH_TOKEN,
			]);
		}
	},
};

