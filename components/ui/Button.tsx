"use client";
import { ButtonHTMLAttributes } from "react";
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center justify-center rounded-2xl px-4 py-2 font-semibold " +
        "text-[var(--brand-text,white)] bg-[var(--brand)] hover:bg-[var(--brand-hover)] " +
        "shadow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition " +
        (props.className || "")
      }
    />
  );
}


