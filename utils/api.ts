import type { UserRole } from "./auth";

const API_BASE_URL = "http://localhost:8080";

export interface ApiResponse<T> {
	isSuccess: boolean;
	code: string;
	message: string;
	result: T;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	memberId: number;
	role: UserRole;
	email: string;
	name: string;
	accessToken: string;
	refreshToken: string;
	teacherId?: number;
}

export interface TeacherDTO {
	teacherId: number;
	name: string;
	email: string;
	phoneNumber?: string;
	kakaoChannelId?: string;
	specialization?: string;
	status?: string;
}

export interface CreateTeacherRequestDTO {
	name: string;
	email: string;
	password: string;
	phoneNumber?: string;
	kakaoChannelId?: string;
	specialization?: string;
}

export interface UpdateTeacherRequestDTO {
	name?: string;
	email?: string;
	phoneNumber?: string;
	kakaoChannelId?: string;
	specialization?: string;
	password?: string;
	status?: string;
}

export interface StudentDTO {
	studentId: number;
	name: string;
	age: number;
	previousSchool?: string;
	targetUniversity?: string;
	phoneNumber?: string;
	kakaoChannelId?: string;
	kakaoUserId?: string;
	assignedTeacherId?: number;
	registrationStatus?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface AiResponseDTO {
	responseId: number;
	messageId: number;
	studentId: number;
	teacherId?: number;
	recommendedResponse: string;
	status: string;
	generatedAt: string;
}

export interface EditResponseRequestDTO {
	editedContent: string;
}

// Get auth token from storage
async function getAuthToken(): Promise<string | null> {
	try {
		// @ts-expect-error - browser may not be available in all contexts
		if (typeof browser !== "undefined" && browser?.storage) {
			const result = await browser.storage.local.get("accessToken");
			return result.accessToken || null;
		}
	} catch {
		// Fallback for non-extension contexts
	}
	return null;
}

// API request helper
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<ApiResponse<T>> {
	const token = await getAuthToken();
	const headers: HeadersInit = {
		"Content-Type": "application/json",
		...options.headers,
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers,
	});

	if (!response.ok) {
		throw new Error(`API Error: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

// Auth API
export const authApi = {
	login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
		return apiRequest<LoginResponse>("/auth/login", {
			method: "POST",
			body: JSON.stringify(data),
		});
	},

	logout: async (memberId: number): Promise<ApiResponse<string>> => {
		return apiRequest<string>(`/auth/logout?memberId=${memberId}`, {
			method: "POST",
		});
	},

	refreshToken: async (
		refreshToken: string,
	): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
		return apiRequest<{ accessToken: string; refreshToken: string }>(
			"/auth/refresh",
			{
				method: "POST",
				body: JSON.stringify({ refreshToken }),
			},
		);
	},
};

// Teacher API
export const teacherApi = {
	getAll: async (): Promise<ApiResponse<TeacherDTO[]>> => {
		return apiRequest<TeacherDTO[]>("/api/teacher/");
	},

	getById: async (id: number): Promise<ApiResponse<TeacherDTO>> => {
		return apiRequest<TeacherDTO>(`/api/teacher/${id}`);
	},

	create: async (
		data: CreateTeacherRequestDTO,
	): Promise<ApiResponse<TeacherDTO>> => {
		return apiRequest<TeacherDTO>("/api/teacher/", {
			method: "POST",
			body: JSON.stringify(data),
		});
	},

	update: async (
		id: number,
		data: UpdateTeacherRequestDTO,
	): Promise<ApiResponse<TeacherDTO>> => {
		return apiRequest<TeacherDTO>(`/api/teacher/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	},

	delete: async (id: number): Promise<ApiResponse<string>> => {
		return apiRequest<string>(`/api/teacher/${id}`, {
			method: "DELETE",
		});
	},

	getStudents: async (id: number): Promise<ApiResponse<StudentDTO[]>> => {
		return apiRequest<StudentDTO[]>(`/api/teacher/${id}/students`);
	},
};

// Student API
export const studentApi = {
	getAll: async (params?: {
		teacherId?: number;
		registrationStatus?: string;
	}): Promise<ApiResponse<StudentDTO[]>> => {
		const queryParams = new URLSearchParams();
		if (params?.teacherId) {
			queryParams.append("teacherId", params.teacherId.toString());
		}
		if (params?.registrationStatus) {
			queryParams.append("registrationStatus", params.registrationStatus);
		}
		const query = queryParams.toString();
		return apiRequest<StudentDTO[]>(`/api/students${query ? `?${query}` : ""}`);
	},

	getById: async (id: number): Promise<ApiResponse<StudentDTO>> => {
		return apiRequest<StudentDTO>(`/api/students/${id}`);
	},

	update: async (
		id: number,
		data: Partial<StudentDTO>,
	): Promise<ApiResponse<StudentDTO>> => {
		return apiRequest<StudentDTO>(`/api/students/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	},

	delete: async (id: number): Promise<ApiResponse<string>> => {
		return apiRequest<string>(`/api/students/${id}`, {
			method: "DELETE",
		});
	},
};

// AI Response API
export const aiResponseApi = {
	getPending: async (
		teacherId?: number,
	): Promise<ApiResponse<AiResponseDTO[]>> => {
		const query = teacherId ? `?teacherId=${teacherId}` : "";
		return apiRequest<AiResponseDTO[]>(`/api/ai-response/pending${query}`);
	},

	approve: async (responseId: number): Promise<ApiResponse<string>> => {
		return apiRequest<string>(`/api/ai-response/${responseId}/approve`, {
			method: "POST",
		});
	},

	edit: async (
		responseId: number,
		data: EditResponseRequestDTO,
	): Promise<ApiResponse<string>> => {
		return apiRequest<string>(`/api/ai-response/${responseId}/edit`, {
			method: "POST",
			body: JSON.stringify(data),
		});
	},
};
