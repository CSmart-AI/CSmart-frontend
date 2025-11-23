import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
	children: ReactNode;
}

export const Button = ({
	variant = "primary",
	size = "md",
	className,
	children,
	...props
}: ButtonProps) => {
	const baseStyles =
		"inline-flex items-center justify-center font-medium transition-all duration-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--focus-ring-color)] disabled:opacity-50 disabled:cursor-not-allowed";

	const variants = {
		primary:
			"bg-[var(--color-primary)] text-white hover:opacity-90 active:opacity-80",
		secondary:
			"bg-[var(--color-dark)] text-[var(--color-text-primary)] hover:bg-opacity-80 active:bg-opacity-70",
		ghost:
			"bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-dark)] active:bg-opacity-70",
		danger:
			"bg-[var(--color-red)] text-white hover:opacity-90 active:opacity-80",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-sm",
		lg: "px-6 py-3 text-base",
	};

	return (
		<button
			className={cn(baseStyles, variants[variant], sizes[size], className)}
			{...props}
		>
			{children}
		</button>
	);
};
