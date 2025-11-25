import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	children: ReactNode;
	variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export const Badge = ({
	children,
	variant = "default",
	className,
	...props
}: BadgeProps) => {
	const variants = {
		default: "bg-gray-100 text-gray-700 border border-gray-300",
		primary:
			"bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30",
		success:
			"bg-[var(--color-green)]/20 text-[var(--color-green)] border border-[var(--color-green)]/30",
		warning:
			"bg-[var(--color-yellow)]/20 text-[var(--color-yellow)] border border-[var(--color-yellow)]/30",
		danger:
			"bg-[var(--color-red)]/20 text-[var(--color-red)] border border-[var(--color-red)]/30",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center px-2 py-1 text-xs font-medium rounded-[var(--radius-medium)]",
				variants[variant],
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
};
