import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: ReactNode;
	error?: string;
	icon?: ReactNode;
	id?: string;
}

export const Input = ({
	label,
	error,
	icon,
	id,
	className,
	...props
}: InputProps) => {
	const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

	return (
		<div className="w-full">
			{label && (
				<label
					htmlFor={inputId}
					className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
				>
					{label}
				</label>
			)}
			<div className="relative">
				{icon && (
					<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]">
						{icon}
					</div>
				)}
				<input
					id={inputId}
					className={cn(
						"w-full px-4 py-3 bg-[var(--color-dark)] border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-medium)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)] focus:border-transparent transition-all duration-100",
						icon ? "pl-10" : "",
						error ? "border-[var(--color-red)]" : "",
						className,
					)}
					{...props}
				/>
			</div>
			{error && <p className="mt-1 text-sm text-[var(--color-red)]">{error}</p>}
		</div>
	);
};
