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
				"bg-white rounded-[var(--radius-large)] border border-gray-200",
				paddingStyles[padding],
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
};
