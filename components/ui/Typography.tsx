import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
	children: ReactNode;
	variant?: "h1" | "h2" | "h3" | "h4" | "body" | "body-secondary" | "small";
	as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export const Typography = ({
	children,
	variant = "body",
	as,
	className,
	...props
}: TypographyProps) => {
	const getDefaultTag = () => {
		if (as) return as;
		if (variant.startsWith("h")) return variant as "h1" | "h2" | "h3" | "h4";
		return "p";
	};

	const Component = getDefaultTag();

	const variants = {
		h1: "text-[40px] font-[590] leading-[44px] tracking-[-0.88px] text-gray-900",
		h2: "text-2xl font-[590] leading-[1.33] text-gray-900",
		h3: "text-xl font-[590] leading-[1.33] text-gray-900",
		h4: "text-lg font-[590] leading-[1.33] text-gray-900",
		body: "text-base font-normal leading-6 text-gray-900",
		"body-secondary": "text-[15px] font-normal leading-6 text-gray-600",
		small: "text-sm font-normal leading-5 text-gray-600",
	};

	if (Component === "h1") {
		return (
			<h1 className={cn(variants[variant], className)} {...props}>
				{children}
			</h1>
		);
	}
	if (Component === "h2") {
		return (
			<h2 className={cn(variants[variant], className)} {...props}>
				{children}
			</h2>
		);
	}
	if (Component === "h3") {
		return (
			<h3 className={cn(variants[variant], className)} {...props}>
				{children}
			</h3>
		);
	}
	if (Component === "h4") {
		return (
			<h4 className={cn(variants[variant], className)} {...props}>
				{children}
			</h4>
		);
	}
	if (Component === "span") {
		return (
			<span className={cn(variants[variant], className)} {...props}>
				{children}
			</span>
		);
	}
	if (Component === "div") {
		return (
			<div className={cn(variants[variant], className)} {...props}>
				{children}
			</div>
		);
	}
	return (
		<p className={cn(variants[variant], className)} {...props}>
			{children}
		</p>
	);
};
