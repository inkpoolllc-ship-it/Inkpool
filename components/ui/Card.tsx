"use client";
import { HTMLAttributes } from "react";
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={
        "rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel)] shadow-[0_12px_30px_rgba(15,23,42,.06)] " +
        className
      }
    />
  );
}


