"use client";
import { ButtonHTMLAttributes } from "react";
export function GhostButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium " +
        "border border-[color:var(--panel-border)] text-[var(--brand-text,white)] bg-[var(--brand)] " +
        "hover:opacity-90 transition " +
        (props.className || "")
      }
    />
  );
}


