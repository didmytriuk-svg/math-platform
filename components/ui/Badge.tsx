import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "sapphire" | "dark" | "lime" | "coral" | "neutral";
}

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    sapphire: "bg-[#0F45CF] text-white",
    dark: "bg-[#191B20] text-white",
    lime: "bg-[#B6E00F] text-[#191B20]",
    coral: "bg-[#ED704B] text-white",
    neutral: "bg-[#E7EBF4] text-[#191B20]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold tracking-tight",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}