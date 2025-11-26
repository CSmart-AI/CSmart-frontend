import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Typography } from "./index";
import { cn } from "@/utils/cn";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
}

export const Modal = ({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
}: ModalProps) => {
	if (!isOpen) return null;

	const sizeClasses = {
		sm: "max-w-md",
		md: "max-w-2xl",
		lg: "max-w-4xl",
		xl: "max-w-6xl",
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onClick={onClose}
		>
			<div
				className={cn(
					"bg-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col",
					sizeClasses[size],
				)}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<Typography variant="h3" className="text-gray-900">
						{title}
					</Typography>
					<Button variant="ghost" size="sm" onClick={onClose} className="p-2">
						<X className="h-5 w-5" />
					</Button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">{children}</div>
			</div>
		</div>
	);
};
