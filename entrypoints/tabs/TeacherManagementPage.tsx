import { Edit, Plus, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Input, Typography } from "@/components/ui";
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
		kakaoId: "",
		kakaoPassword: "",
	});

	const loadTeachers = useCallback(async () => {
		setLoading(true);
		try {
			const response = await teacherApi.getAll();
			if (response.isSuccess && response.result) {
				setTeachers(response.result);
			}
		} catch (error) {
			console.error("Failed to load teachers:", error);
			setTeachers([mockTeacher]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadTeachers();
	}, [loadTeachers]);

	const handleCreate = async () => {
		if (
			!formData.name ||
			!formData.email ||
			!formData.password ||
			!formData.kakaoId ||
			!formData.kakaoPassword
		) {
			alert(
				"이름, 이메일, 비밀번호, 카카오 계정 아이디, 카카오 계정 비밀번호는 필수입니다.",
			);
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
				...(formData.kakaoPassword && {
					kakaoPassword: formData.kakaoPassword,
				}),
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
			kakaoId: "",
			kakaoPassword: "",
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
			kakaoId: "", // 편집 시에는 비워둠 (보안상 이유)
			kakaoPassword: "", // 변경 시에만 입력
		});
	};

	return (
		<div className="flex min-h-[calc(100vh-var(--header-height))]">
			{/* Main Content Area */}
			<main className="flex-1 bg-[var(--color-background-primary)]">
				<div className="w-full px-[var(--page-padding-inline)] py-[var(--page-padding-block)]">
					{/* Page Header */}
					<div className="mb-8">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-3">
								<Users className="h-6 w-6 text-[var(--color-indigo)]" />
								<Typography variant="h2">선생님 관리</Typography>
							</div>
							<Button
								size="md"
								onClick={() => {
									resetForm();
									setEditingTeacher(null);
									setShowCreateModal(true);
								}}
							>
								<Plus className="h-4 w-4 mr-2" />
								선생님 추가
							</Button>
						</div>
						<Typography
							variant="body-secondary"
							className="text-[var(--color-text-hexSecondary)]"
						>
							선생님 채널을 생성하고 관리합니다
						</Typography>
					</div>

					<div className="space-y-6">
						{/* Teachers List */}
						{loading ? (
							<Card padding="lg" className="text-center">
								<Typography variant="body-secondary">로딩 중...</Typography>
							</Card>
						) : teachers.length === 0 ? (
							<Card padding="lg" className="text-center">
								<Typography variant="body-secondary">
									등록된 선생님이 없습니다.
								</Typography>
							</Card>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{teachers.map((teacher) => (
									<Card
										key={teacher.teacherId}
										padding="lg"
										className="border border-gray-200 hover:shadow-md transition-shadow duration-100"
									>
										<div className="flex justify-between items-start mb-5">
											<div className="flex-1">
												<Typography variant="h4" className="mb-1">
													{teacher.name}
												</Typography>
												<Typography
													variant="body-secondary"
													className="text-sm"
												>
													{teacher.email}
												</Typography>
											</div>
											<div className="flex gap-2 ml-3">
												<button
													type="button"
													onClick={() => openEditModal(teacher)}
													className="p-2 text-[var(--color-indigo)] hover:bg-[var(--color-indigo)]/10 rounded-[var(--radius-medium)] transition-colors duration-100"
													aria-label="수정"
												>
													<Edit className="h-4 w-4" />
												</button>
												<button
													type="button"
													onClick={() => handleDelete(teacher.teacherId)}
													className="p-2 text-[var(--color-red)] hover:bg-[var(--color-red)]/10 rounded-[var(--radius-medium)] transition-colors duration-100"
													aria-label="삭제"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</div>

										<div className="space-y-2.5">
											{teacher.phoneNumber && (
												<div className="flex items-start">
													<Typography
														variant="small"
														className="text-[var(--color-text-hexSecondary)] min-w-[80px]"
													>
														전화번호:
													</Typography>
													<Typography
														variant="small"
														className="font-medium text-gray-900"
													>
														{teacher.phoneNumber}
													</Typography>
												</div>
											)}
											{teacher.kakaoChannelId && (
												<div className="flex items-start">
													<Typography
														variant="small"
														className="text-[var(--color-text-hexSecondary)] min-w-[80px]"
													>
														카카오 채널:
													</Typography>
													<Typography
														variant="small"
														className="font-medium text-gray-900"
													>
														{teacher.kakaoChannelId}
													</Typography>
												</div>
											)}
											{teacher.specialization && (
												<div className="flex items-start">
													<Typography
														variant="small"
														className="text-[var(--color-text-hexSecondary)] min-w-[80px]"
													>
														전문분야:
													</Typography>
													<Typography
														variant="small"
														className="font-medium text-gray-900"
													>
														{teacher.specialization}
													</Typography>
												</div>
											)}
											<div className="flex items-center pt-1">
												<Typography
													variant="small"
													className="text-[var(--color-text-hexSecondary)] min-w-[80px]"
												>
													상태:
												</Typography>
												<Badge
													variant={
														teacher.status === "ACTIVE" ? "success" : "default"
													}
												>
													{teacher.status || "ACTIVE"}
												</Badge>
											</div>
										</div>
									</Card>
								))}
							</div>
						)}
					</div>
				</div>
			</main>

			{/* Create/Edit Modal */}
			{(showCreateModal || editingTeacher) && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[var(--dialog)] p-4">
					<Card
						padding="lg"
						className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
					>
						<Typography variant="h2" className="mb-6">
							{editingTeacher ? "선생님 수정" : "선생님 추가"}
						</Typography>

						<div className="space-y-5">
							{/* 기본 정보 섹션 */}
							<div className="space-y-4">
								<Typography variant="h4" className="text-gray-900 mb-3">
									기본 정보
								</Typography>
								<Input
									label={
										<>
											이름 <span className="text-[var(--color-red)]">*</span>
										</>
									}
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									placeholder="이름을 입력하세요"
									required
								/>

								<Input
									label={
										<>
											이메일 <span className="text-[var(--color-red)]">*</span>
										</>
									}
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									placeholder="이메일을 입력하세요"
									required
								/>

								<Input
									label={
										<>
											비밀번호{" "}
											{!editingTeacher && (
												<span className="text-[var(--color-red)]">*</span>
											)}
										</>
									}
									type="password"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									placeholder={
										editingTeacher
											? "변경 시에만 입력"
											: "비밀번호를 입력하세요"
									}
									required={!editingTeacher}
								/>
							</div>

							{/* 카카오 계정 정보 섹션 */}
							<div className="space-y-4 pt-2 border-t border-gray-200">
								<Typography variant="h4" className="text-gray-900 mb-3">
									카카오 계정 정보
								</Typography>
								<Input
									label={
										<>
											카카오 계정 아이디{" "}
											{!editingTeacher && (
												<span className="text-[var(--color-red)]">*</span>
											)}
										</>
									}
									type="text"
									value={formData.kakaoId}
									onChange={(e) =>
										setFormData({ ...formData, kakaoId: e.target.value })
									}
									placeholder="카카오 계정 아이디를 입력하세요"
									required={!editingTeacher}
									disabled={!!editingTeacher}
								/>

								<Input
									label={
										<>
											카카오 계정 비밀번호{" "}
											{!editingTeacher && (
												<span className="text-[var(--color-red)]">*</span>
											)}
										</>
									}
									type="password"
									value={formData.kakaoPassword}
									onChange={(e) =>
										setFormData({ ...formData, kakaoPassword: e.target.value })
									}
									placeholder={
										editingTeacher
											? "변경 시에만 입력"
											: "카카오 계정 비밀번호를 입력하세요"
									}
									required={!editingTeacher}
								/>
							</div>

							{/* 추가 정보 섹션 */}
							<div className="space-y-4 pt-2 border-t border-gray-200">
								<Typography variant="h4" className="text-gray-900 mb-3">
									추가 정보
								</Typography>
								<Input
									label="전화번호"
									type="tel"
									value={formData.phoneNumber}
									onChange={(e) =>
										setFormData({ ...formData, phoneNumber: e.target.value })
									}
									placeholder="전화번호를 입력하세요"
								/>

								<Input
									label="카카오 채널 ID"
									type="text"
									value={formData.kakaoChannelId}
									onChange={(e) =>
										setFormData({ ...formData, kakaoChannelId: e.target.value })
									}
									placeholder="카카오 채널 ID를 입력하세요"
								/>

								<Input
									label="전문분야"
									type="text"
									value={formData.specialization}
									onChange={(e) =>
										setFormData({ ...formData, specialization: e.target.value })
									}
									placeholder="전문분야를 입력하세요"
								/>
							</div>
						</div>

						<div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
							<Button
								variant="ghost"
								className="flex-1"
								onClick={() => {
									setShowCreateModal(false);
									setEditingTeacher(null);
									resetForm();
								}}
							>
								취소
							</Button>
							<Button
								className="flex-1"
								onClick={editingTeacher ? handleUpdate : handleCreate}
							>
								{editingTeacher ? "수정" : "생성"}
							</Button>
						</div>
					</Card>
				</div>
			)}
		</div>
	);
};

export default TeacherManagementPage;
