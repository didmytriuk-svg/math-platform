"use client";

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearchSubmit?: (query: string) => void;
}

export function SearchInput({
  className,
  onSearchSubmit,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 select-none" />
      <input
        type="text"
        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 hover:border-slate-300"
        {...props}
      />
    </div>
  );
}