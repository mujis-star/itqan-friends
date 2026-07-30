"use client";
import React, { useRef, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      magnetic = false,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || !buttonRef.current) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
      const x = (clientX - (left + width / 2)) * 0.2;
      const y = (clientY - (top + height / 2)) * 0.2;
      setPosition({ x, y });
    };

    const handleMouseLeave = () => {
      if (magnetic) {
        setPosition({ x: 0, y: 0 });
      }
    };

    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer select-none";

    const variants = {
      primary:
        "bg-primary text-slate-950 hover:bg-opacity-90 shadow-[0_0_20px_rgba(14,165,164,0.3)] hover:shadow-[0_0_30px_rgba(14,165,164,0.5)] border border-primary/20",
      secondary:
        "bg-secondary text-white hover:bg-slate-700 border border-white/10",
      outline:
        "border border-white/15 text-foreground hover:bg-white/10 hover:border-primary/50",
      ghost: "text-foreground hover:bg-white/10",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs uppercase tracking-wider",
      md: "px-6 py-3 text-sm tracking-wide",
      lg: "px-8 py-4 text-base font-bold tracking-wide",
    };

    return (
      <motion.button
        ref={(node) => {
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 250, damping: 15, mass: 0.1 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
