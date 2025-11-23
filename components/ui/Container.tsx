import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Container = ({
	children,
	maxWidth = "xl",
	className,
	...props
}: ContainerProps) => {
	const maxWidthStyles = {
		sm: "max-w-640px",
		md: "max-w-768px",
		lg: "max-w-1024px",
		xl: "max-w-7xl",
		full: "max-w-full",
	};

	return (
		<div
			className={cn(
				"mx-auto px-[var(--page-padding-inline)]",
				maxWidthStyles[maxWidth],
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
};
