const API_BASE_URL = "http://localhost:8080";

export interface ApiResponse<T> {
	isSuccess: boolean;
	code: string;
	message: string;
	result: T;
}

export interface KakaoLoginRequest {
	kakaoId: string;
	kakaoPassword: string;
}

export interface KakaoLoginResponse {
	userId: number;
	role: "ADMIN" | "TEACHER";
	name: string;
	email: string;
	accessToken: string;
	refreshToken: string;
}

export interface SignUpRequest {
	name: string;
	email: string;
	password: string;
	nickname: string;
}

export interface SignUpResponse {
	memberId: number;
	email: string;
	name: string;
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
	kakaoId: string; // 카카오 계정 아이디 (필수)
	kakaoPassword: string; // 카카오 계정 비밀번호 (필수)
}

export interface UpdateTeacherRequestDTO {
	name?: string;
	email?: string;
	phoneNumber?: string;
	kakaoChannelId?: string;
	specialization?: string;
	password?: string;
	kakaoPassword?: string; // 카카오 계정 비밀번호 (선택)
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
		if (typeof browser !== "undefined" && browser?.storage) {
			const result = await browser.storage.local.get("accessToken");
			return result.accessToken || null;
		}
	} catch {
		// Fallback for non-extension contexts
	}
	return null;
}

// 개발 모드 확인
const isDev = import.meta.env.DEV;

// API request helper
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<ApiResponse<T>> {
	const token = await getAuthToken();
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options.headers as Record<string, string>),
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const url = `${API_BASE_URL}${endpoint}`;
	const requestOptions = {
		...options,
		headers,
	};

	// 개발 모드에서 요청 정보 로깅
	if (isDev) {
		console.group(`🌐 API Request: ${options.method || "GET"} ${endpoint}`);
		console.log("URL:", url);
		console.log("Headers:", headers);
		if (options.body) {
			try {
				console.log("Body:", JSON.parse(options.body as string));
			} catch {
				console.log("Body:", options.body);
			}
		}
	}

	let response: Response;
	try {
		const startTime = Date.now();
		response = await fetch(url, requestOptions);
		const duration = Date.now() - startTime;

		// 개발 모드에서 응답 상태 정보 로깅
		if (isDev) {
			console.log(
				`✅ Response Status: ${response.status} ${response.statusText} (${duration}ms)`,
			);
			console.log(
				"Response Headers:",
				Object.fromEntries(response.headers.entries()),
			);
		}
	} catch (error) {
		// 개발 모드에서 에러 로깅
		if (isDev) {
			console.error("❌ Network Error:", error);
			console.groupEnd();
		}

		// 네트워크 오류 또는 CORS 오류
		if (error instanceof TypeError && error.message.includes("fetch")) {
			throw new Error(
				"서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.",
			);
		}
		throw error;
	}

	// 응답 본문을 읽기 전에 Content-Type 확인
	const contentType = response.headers.get("content-type");
	let data: unknown;
	let responseText: string | null = null;

	try {
		if (contentType?.includes("application/json")) {
			// JSON 응답 시도
			try {
				data = await response.json();

				// 개발 모드에서 응답 데이터 로깅
				if (isDev) {
					console.log("Response Data:", data);
				}
			} catch (jsonError) {
				// JSON 파싱 실패 시 텍스트로 읽기
				responseText = await response.text();

				// 개발 모드에서 응답 텍스트 로깅
				if (isDev) {
					console.error("❌ JSON 파싱 실패");
					console.log("Response Text:", responseText);
				}

				const errorMessage =
					jsonError instanceof Error ? jsonError.message : String(jsonError);
				throw new Error(
					responseText || `서버 응답을 파싱할 수 없습니다: ${errorMessage}`,
				);
			}
		} else {
			// JSON이 아닌 경우 텍스트로 읽기
			responseText = await response.text();

			// 개발 모드에서 응답 텍스트 로깅
			if (isDev) {
				console.log("Response Text:", responseText);
			}

			if (!response.ok) {
				throw new Error(
					responseText ||
						`API Error: ${response.status} ${response.statusText}`,
				);
			}
			// 성공했지만 JSON이 아닌 경우
			throw new Error("서버 응답 형식이 올바르지 않습니다.");
		}
	} catch (error) {
		// 개발 모드에서 에러 로깅
		if (isDev) {
			console.error("❌ Error parsing response:", error);
			console.groupEnd();
		}
		// 서버 응답을 그대로 throw
		throw error;
	}

	if (!response.ok) {
		// 개발 모드에서 에러 응답 로깅
		if (isDev) {
			console.error(`❌ API Error: ${response.status} ${response.statusText}`);
			console.log("Error Response Data:", data);
			console.groupEnd();
		}

		// API 응답 형식에 에러 메시지가 있는 경우 사용
		if (data && typeof data === "object" && "message" in data) {
			const message = (data as { message?: string }).message;
			const code = (data as { code?: string }).code;
			if (isDev) {
				console.error(`Error Code: ${code || "UNKNOWN"}`);
				console.error(`Error Message: ${message || "No message"}`);
			}
			throw new Error(
				message || `API Error: ${response.status} ${response.statusText}`,
			);
		}
		throw new Error(`API Error: ${response.status} ${response.statusText}`);
	}

	// 개발 모드에서 성공 응답 로깅 종료
	if (isDev) {
		console.groupEnd();
	}

	// 타입 가드: data가 ApiResponse 형식인지 확인
	if (data && typeof data === "object" && "isSuccess" in data) {
		return data as ApiResponse<T>;
	}

	throw new Error("서버 응답 형식이 올바르지 않습니다.");
}

// Auth API
export const authApi = {
	/**
	 * 카카오 로그인
	 */
	kakaoLogin: async (
		data: KakaoLoginRequest,
	): Promise<ApiResponse<KakaoLoginResponse>> => {
		return apiRequest<KakaoLoginResponse>("/auth/kakao-login", {
			method: "POST",
			body: JSON.stringify(data),
		});
	},

	/**
	 * 로그아웃
	 */
	logout: async (): Promise<ApiResponse<string>> => {
		return apiRequest<string>("/auth/logout", {
			method: "POST",
		});
	},

	/**
	 * 토큰 재발급
	 * refresh token 엔드포인트는 Authorization 헤더 없이 호출
	 */
	refreshToken: async (
		refreshToken: string,
	): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
		// refresh token API는 Authorization 헤더 없이 호출
		const url = `${API_BASE_URL}/auth/refresh`;
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refreshToken }),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || `토큰 갱신 실패: ${response.status}`,
			);
		}

		return response.json();
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

	getByStudent: async (
		studentId: number,
	): Promise<ApiResponse<AiResponseDTO[]>> => {
		return apiRequest<AiResponseDTO[]>(
			`/api/students/${studentId}/ai-responses`,
		);
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

// Kakao API
export interface SendMessageRequest {
	recipient: string;
	message: string;
	messageType?: string;
	imageUrl?: string;
	fileName?: string;
	chatId: string;
}

export interface SendMessageResponse {
	success: boolean;
	message: string;
	result?: {
		messageId: string;
		sentAt: string;
		status: string;
	};
}

export type ChannelType = "ADMIN" | "TEACHER";

export interface ChatListItem {
	talk_user: {
		chat_id: string;
		nickname: string;
		id: string;
		profile_image_url?: string;
		status_message?: string;
		active?: boolean;
		user_type?: number;
		original_profile_image_url?: string;
		full_profile_image_url?: string;
	};
	last_seen_log_id?: string;
	created_at?: number;
	last_message?: string;
	is_replied?: boolean;
	is_read?: boolean;
	unread_count?: number;
	need_manager_confirm?: boolean;
	is_deleted?: boolean;
	updated_at?: number;
	id?: string;
	assignee_id?: number;
	last_log_id?: string;
	is_done?: boolean;
	user_last_seen_log_id?: string;
	version?: number;
	last_log_send_at?: number;
	is_blocked?: boolean;
	is_starred?: boolean;
	is_user_left?: boolean;
	profile_id?: string;
	encoded_profile_id?: string;
}

export interface ChatListResponse {
	success: boolean;
	message: string;
	data?: {
		id: string;
		savedAt: string;
		totalCount: number;
		chatList: {
			items: ChatListItem[];
			has_next?: boolean;
		};
	};
}

export const kakaoApi = {
	/**
	 * 카카오톡 채팅 목록 가져오기 (CSmart-kakaotalk 서비스 사용)
	 */
	getChatList: async (): Promise<ApiResponse<ChatListResponse>> => {
		// localhost:3001의 CSmart-kakaotalk API 사용
		const KAKAOTALK_API_URL = "http://localhost:3001";
		const token = await getAuthToken();
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(`${KAKAOTALK_API_URL}/api/message/chat-list`, {
			method: "POST",
			headers,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message ||
					`API Error: ${response.status} ${response.statusText}`,
			);
		}

		const responseData = await response.json();

		// CSmart-kakaotalk 응답 형식에 맞춰 변환
		return {
			isSuccess: responseData.success || false,
			code: responseData.success ? "KAKAO_2000" : "KAKAO_ERROR",
			message: responseData.message || "",
			result: responseData,
		};
	},

	/**
	 * 카카오톡 메시지 전송 (CSmart-kakaotalk 서비스 사용)
	 */
	sendMessage: async (
		data: SendMessageRequest,
	): Promise<ApiResponse<SendMessageResponse>> => {
		// localhost:3001의 CSmart-kakaotalk API 사용
		const KAKAOTALK_API_URL = "http://localhost:3001";
		const token = await getAuthToken();
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(`${KAKAOTALK_API_URL}/api/message/send`, {
			method: "POST",
			headers,
			body: JSON.stringify({
				recipient: data.recipient,
				message: data.message,
				messageType: data.messageType || "text",
				chatId: data.chatId,
				imageUrl: data.imageUrl,
				fileName: data.fileName,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message ||
					`API Error: ${response.status} ${response.statusText}`,
			);
		}

		const responseData = await response.json();

		// CSmart-kakaotalk 응답 형식에 맞춰 변환
		return {
			isSuccess: responseData.success || false,
			code: responseData.success ? "KAKAO_2000" : "KAKAO_ERROR",
			message: responseData.message || "",
			result: responseData.result || responseData,
		};
	},

	/**
	 * 카카오톡 서비스 상태 확인
	 */
	checkHealth: async (
		channelType: ChannelType = "ADMIN",
	): Promise<ApiResponse<boolean>> => {
		return apiRequest<boolean>(`/kakao/health?channelType=${channelType}`);
	},
};

// Message API
export interface MessageDTO {
	messageId: number;
	studentId?: number;
	teacherId?: number;
	content: string;
	messageType: string;
	senderType: string;
	sentAt?: string;
	createdAt?: string;
}

export const messageApi = {
	/**
	 * 전체 메시지 조회
	 */
	getAll: async (limit?: number): Promise<ApiResponse<MessageDTO[]>> => {
		const query = limit ? `?limit=${limit}` : "";
		return apiRequest<MessageDTO[]>(`/api/messages${query}`);
	},

	/**
	 * 메시지 상세 조회
	 */
	getById: async (id: number): Promise<ApiResponse<MessageDTO>> => {
		return apiRequest<MessageDTO>(`/api/messages/${id}`);
	},

	/**
	 * 학생별 메시지 조회
	 */
	getByStudent: async (
		studentId: number,
		limit?: number,
	): Promise<ApiResponse<MessageDTO[]>> => {
		const query = limit ? `?limit=${limit}` : "";
		return apiRequest<MessageDTO[]>(
			`/api/messages/student/${studentId}${query}`,
		);
	},

	/**
	 * 선생님별 메시지 조회
	 */
	getByTeacher: async (
		teacherId: number,
		limit?: number,
	): Promise<ApiResponse<MessageDTO[]>> => {
		const query = limit ? `?limit=${limit}` : "";
		return apiRequest<MessageDTO[]>(
			`/api/messages/teacher/${teacherId}${query}`,
		);
	},
};

// AI API
export const aiApi = {
	/**
	 * AI 스케줄러 수동 트리거
	 */
	triggerOnce: async (): Promise<ApiResponse<string>> => {
		return apiRequest<string>("/api/ai/trigger-once", {
			method: "POST",
		});
	},
};

// Transfer API
export interface TransferToTeacherRequestDTO {
	studentId: number;
	teacherId: number;
}

export interface ExtractedStudentInfo {
	name?: string;
	age?: number;
	previousSchool?: string;
	targetUniversity?: string;
	phoneNumber?: string;
	major?: string;
	currentGrade?: string;
	desiredSemester?: string;
	additionalInfo?: Record<string, unknown>;
}

export interface TransferToTeacherResponseDTO {
	studentId: number;
	assignedTeacherId: number;
	teacherName: string;
	studentName: string;
	extractedInfo?: ExtractedStudentInfo;
	savedMessageCount?: number;
	transferStatus: string;
}

export const transferApi = {
	/**
	 * 학생을 선생님 채널로 전환
	 */
	transferToTeacher: async (
		data: TransferToTeacherRequestDTO,
	): Promise<ApiResponse<TransferToTeacherResponseDTO>> => {
		return apiRequest<TransferToTeacherResponseDTO>(
			"/api/transfer/to-teacher",
			{
				method: "POST",
				body: JSON.stringify(data),
			},
		);
	},
};
