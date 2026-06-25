import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Button, ButtonProps } from "@heroui/react";
import { cn } from "../utils/Util";

interface AnimatedButtonProps extends ButtonProps {
	motionProps?: HTMLMotionProps<"div">;
	containerClassName?: string;
	showHalo?: boolean;
	haloDirection?: "cw" | "ccw";
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, motionProps, containerClassName, className, ...buttonProps }) => {
	// Varsayılan yükselme ve ölçekleme animasyonu
	const defaultMotion: HTMLMotionProps<"div"> = {
		whileHover: { y: -15, scale: 1.02 },
		transition: { type: "spring", stiffness: 300, damping: 15 },
		...motionProps,
	};

	return (
		<motion.div {...defaultMotion} className={cn("relative group", containerClassName)}>
			<Button {...buttonProps} className={cn(className)}>
				{children}
			</Button>
		</motion.div>
	);
};
