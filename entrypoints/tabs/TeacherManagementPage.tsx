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
		<div className="flex min-h-[calc(100vh-var(--header-height))]">
			{/* Main Content Area */}
			<main className="flex-1 bg-[var(--color-background)]">
				<div className="w-full px-[var(--page-padding-inline)] py-6">
					{/* Page Header */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Users className="h-5 w-5 text-[var(--color-primary)]" />
								<Typography variant="h3">선생님 관리</Typography>
							</div>
							<Button
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
						<Typography variant="body-secondary">
							선생님 채널을 생성하고 관리합니다
						</Typography>
					</div>

					<div className="space-y-6">
						{/* Teachers List */}
						{loading ? (
							<Card padding="lg" className="text-center">
								<Typography variant="body-secondary">로딩 중...</Typography>
							</Card>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{(teachers.length === 0 ? [mockTeacher] : teachers).map(
									(teacher) => (
										<Card
											key={teacher.teacherId}
											padding="lg"
											className="border border-[rgba(255,255,255,0.05)]"
										>
											<div className="flex justify-between items-start mb-4">
												<div>
													<Typography variant="h3">{teacher.name}</Typography>
													<Typography
														variant="body-secondary"
														className="text-sm"
													>
														{teacher.email}
													</Typography>
												</div>
												<div className="flex gap-2">
													<button
														type="button"
														onClick={() => openEditModal(teacher)}
														className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
													>
														<Edit className="h-4 w-4" />
													</button>
													<button
														type="button"
														onClick={() => handleDelete(teacher.teacherId)}
														className="p-2 text-[var(--color-red)] hover:bg-[var(--color-red)]/10 rounded-lg transition-colors"
													>
														<Trash2 className="h-4 w-4" />
													</button>
												</div>
											</div>

											<div className="space-y-2">
												{teacher.phoneNumber && (
													<Typography variant="small">
														<span className="text-[var(--color-text-secondary)]">
															전화번호:
														</span>{" "}
														<span className="font-medium">
															{teacher.phoneNumber}
														</span>
													</Typography>
												)}
												{teacher.kakaoChannelId && (
													<Typography variant="small">
														<span className="text-[var(--color-text-secondary)]">
															카카오 채널 ID:
														</span>{" "}
														<span className="font-medium">
															{teacher.kakaoChannelId}
														</span>
													</Typography>
												)}
												{teacher.specialization && (
													<Typography variant="small">
														<span className="text-[var(--color-text-secondary)]">
															전문분야:
														</span>{" "}
														<span className="font-medium">
															{teacher.specialization}
														</span>
													</Typography>
												)}
												<Typography variant="small">
													<span className="text-[var(--color-text-secondary)]">
														상태:
													</span>{" "}
													<Badge
														variant={
															teacher.status === "ACTIVE"
																? "success"
																: "default"
														}
													>
														{teacher.status || "ACTIVE"}
													</Badge>
												</Typography>
											</div>
										</Card>
									),
								)}
							</div>
						)}
					</div>
				</div>
			</main>

			{/* Create/Edit Modal */}
			{(showCreateModal || editingTeacher) && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<Card padding="lg" className="w-full max-w-md">
						<Typography variant="h2" className="mb-4">
							{editingTeacher ? "선생님 수정" : "선생님 추가"}
						</Typography>

						<div className="space-y-4">
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
									editingTeacher ? "변경 시에만 입력" : "비밀번호를 입력하세요"
								}
							/>

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

						<div className="flex gap-3 mt-6">
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
