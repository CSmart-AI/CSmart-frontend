import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	padding?: "none" | "sm" | "md" | "lg";
}

export const Card = ({
	children,
	padding = "md",
	className,
	...props
}: CardProps) => {
	const paddingStyles = {
		none: "",
		sm: "p-4",
		md: "p-6",
		lg: "p-8",
	};

	return (
		<div
			className={cn(
				"bg-[var(--color-dark)] rounded-[var(--radius-large)] border border-[rgba(255,255,255,0.05)]",
				paddingStyles[padding],
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
};
