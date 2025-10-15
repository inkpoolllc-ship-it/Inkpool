"use client";
import { HTMLAttributes } from "react";
export function Badge({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={
        "inline-flex items-center rounded-full border border-[var(--brand)] " +
        "text-[var(--brand)] bg-[color:rgba(14,167,122,.12)] px-3 py-1 text-xs " +
        className
      }
    />
  );
}


