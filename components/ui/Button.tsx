import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "lime" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[#0F45CF] text-white hover:bg-[#0c3bb3] active:translate-y-px",
    dark: "bg-[#191B20] text-white hover:bg-[#282b33] active:translate-y-px",
    lime: "bg-[#B6E00F] text-[#191B20] font-bold hover:bg-[#a6cc0d] active:translate-y-px",
    secondary: "bg-[#E7EBF4] text-[#191B20] hover:bg-[#d8dfea] active:translate-y-px",
    outline: "border border-[#CAD1E4] bg-white text-[#191B20] hover:bg-[#F4F6FB]",
  };

  const sizes = {
    sm: "h-8 px-3.5 text-xs font-semibold rounded-lg",
    md: "h-10 px-5 text-sm font-semibold rounded-xl",
    lg: "h-12 px-7 text-base font-semibold rounded-xl",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all select-none disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}