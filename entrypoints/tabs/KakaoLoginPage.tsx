import { Card, Typography } from "@/components/ui";

const KakaoLoginPage = () => {
	return (
		<div className="space-y-6">
			<Card padding="lg" className="text-center">
				<Typography variant="h2" className="mb-4">
					카카오톡 로그인
				</Typography>
				<Typography variant="body-secondary" className="mb-6">
					카카오톡 로그인 API가 준비되면 여기에 구현됩니다.
				</Typography>
				<Card
					padding="md"
					className="bg-[var(--color-yellow)]/10 border-[var(--color-yellow)]/20"
				>
					<Typography variant="small" className="text-[var(--color-yellow)]">
						페이지 준비 중... 카카오톡 로그인 기능은 백엔드 API가 준비되면
						구현할 예정
					</Typography>
				</Card>
			</Card>
		</div>
	);
};

export default KakaoLoginPage;
