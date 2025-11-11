import { Edit, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
	type CreateTeacherRequestDTO,
	type TeacherDTO,
	teacherApi,
} from "@/utils/api";

// 목업 선생님 데이터
const mockTeacher: TeacherDTO = {
	teacherId: 0,
	name: "김선생",
	email: "teacher@example.com",
	phoneNumber: "010-1234-5678",
	kakaoChannelId: "kakao_channel_001",
	specialization: "수학",
	status: "ACTIVE",
};

const TeacherManagementPage = () => {
	const [teachers, setTeachers] = useState<TeacherDTO[]>([]);
	const [loading, setLoading] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingTeacher, setEditingTeacher] = useState<TeacherDTO | null>(null);
	const [formData, setFormData] = useState<CreateTeacherRequestDTO>({
		name: "",
		email: "",
		password: "",
		phoneNumber: "",
		kakaoChannelId: "",
		specialization: "",
	});

	useEffect(() => {
		loadTeachers();
	}, []);

	const loadTeachers = async () => {
		setLoading(true);
		try {
			const response = await teacherApi.getAll();
			if (response.isSuccess && response.result) {
				setTeachers(response.result);
			}
		} catch (error) {
			console.error("Failed to load teachers:", error);
			// API 실패 시 목업 데이터 표시
			setTeachers([mockTeacher]);
		} finally {
			setLoading(false);
		}
	};

	const handleCreate = async () => {
		if (!formData.name || !formData.email || !formData.password) {
			alert("이름, 이메일, 비밀번호는 필수입니다.");
			return;
		}

		try {
			const response = await teacherApi.create(formData);
			if (response.isSuccess) {
				await loadTeachers();
				setShowCreateModal(false);
				resetForm();
			} else {
				alert(response.message || "선생님 생성에 실패했습니다.");
			}
		} catch (error) {
			alert(
				`오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	};

	const handleUpdate = async () => {
		if (!editingTeacher) return;

		try {
			const response = await teacherApi.update(editingTeacher.teacherId, {
				name: formData.name,
				email: formData.email,
				phoneNumber: formData.phoneNumber,
				kakaoChannelId: formData.kakaoChannelId,
				specialization: formData.specialization,
				...(formData.password && { password: formData.password }),
			});
			if (response.isSuccess) {
				await loadTeachers();
				setEditingTeacher(null);
				resetForm();
			} else {
				alert(response.message || "선생님 수정에 실패했습니다.");
			}
		} catch (error) {
			alert(
				`오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("정말 삭제하시겠습니까?")) return;

		try {
			const response = await teacherApi.delete(id);
			if (response.isSuccess) {
				await loadTeachers();
			} else {
				alert(response.message || "선생님 삭제에 실패했습니다.");
			}
		} catch (error) {
			alert(
				`오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			email: "",
			password: "",
			phoneNumber: "",
			kakaoChannelId: "",
			specialization: "",
		});
	};

	const openEditModal = (teacher: TeacherDTO) => {
		setEditingTeacher(teacher);
		setFormData({
			name: teacher.name,
			email: teacher.email,
			password: "",
			phoneNumber: teacher.phoneNumber || "",
			kakaoChannelId: teacher.kakaoChannelId || "",
			specialization: teacher.specialization || "",
		});
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
							<Users className="h-6 w-6 text-blue-600" />
							선생님 관리
						</h1>
						<p className="text-gray-600 mt-1">
							선생님 채널을 생성하고 관리합니다
						</p>
					</div>
					<button
						type="button"
						onClick={() => {
							resetForm();
							setEditingTeacher(null);
							setShowCreateModal(true);
						}}
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
					>
						<Plus className="h-5 w-5" />
						선생님 추가
					</button>
				</div>
			</div>

			{/* Teachers List */}
			{loading ? (
				<div className="bg-white rounded-lg shadow-sm p-12 text-center">
					<div className="text-gray-600">로딩 중...</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* API에서 가져온 데이터가 없을 때 목업 데이터 표시 */}
					{(teachers.length === 0 ? [mockTeacher] : teachers).map((teacher) => (
						<div
							key={teacher.teacherId}
							className="bg-white rounded-lg shadow-sm p-6"
						>
							<div className="flex justify-between items-start mb-4">
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										{teacher.name}
									</h3>
									<p className="text-sm text-gray-600">{teacher.email}</p>
								</div>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => openEditModal(teacher)}
										className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
									>
										<Edit className="h-4 w-4" />
									</button>
									<button
										type="button"
										onClick={() => handleDelete(teacher.teacherId)}
										className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							</div>

							<div className="space-y-2">
								{teacher.phoneNumber && (
									<div className="text-sm">
										<span className="text-gray-600">전화번호:</span>{" "}
										<span className="font-medium">{teacher.phoneNumber}</span>
									</div>
								)}
								{teacher.kakaoChannelId && (
									<div className="text-sm">
										<span className="text-gray-600">카카오 채널 ID:</span>{" "}
										<span className="font-medium">
											{teacher.kakaoChannelId}
										</span>
									</div>
								)}
								{teacher.specialization && (
									<div className="text-sm">
										<span className="text-gray-600">전문분야:</span>{" "}
										<span className="font-medium">
											{teacher.specialization}
										</span>
									</div>
								)}
								<div className="text-sm">
									<span className="text-gray-600">상태:</span>{" "}
									<span
										className={`font-medium ${
											teacher.status === "ACTIVE"
												? "text-green-600"
												: "text-gray-600"
										}`}
									>
										{teacher.status || "ACTIVE"}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Create/Edit Modal */}
			{(showCreateModal || editingTeacher) && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							{editingTeacher ? "선생님 수정" : "선생님 추가"}
						</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									이름 <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="이름을 입력하세요"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									이메일 <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="이메일을 입력하세요"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									비밀번호{" "}
									{!editingTeacher && <span className="text-red-500">*</span>}
								</label>
								<input
									type="password"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder={
										editingTeacher
											? "변경 시에만 입력"
											: "비밀번호를 입력하세요"
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									전화번호
								</label>
								<input
									type="tel"
									value={formData.phoneNumber}
									onChange={(e) =>
										setFormData({ ...formData, phoneNumber: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="전화번호를 입력하세요"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									카카오 채널 ID
								</label>
								<input
									type="text"
									value={formData.kakaoChannelId}
									onChange={(e) =>
										setFormData({ ...formData, kakaoChannelId: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="카카오 채널 ID를 입력하세요"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									전문분야
								</label>
								<input
									type="text"
									value={formData.specialization}
									onChange={(e) =>
										setFormData({ ...formData, specialization: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="전문분야를 입력하세요"
								/>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								type="button"
								onClick={() => {
									setShowCreateModal(false);
									setEditingTeacher(null);
									resetForm();
								}}
								className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
							>
								취소
							</button>
							<button
								type="button"
								onClick={editingTeacher ? handleUpdate : handleCreate}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								{editingTeacher ? "수정" : "생성"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TeacherManagementPage;
