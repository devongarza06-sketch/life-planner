"use client";
import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export default function Modal({ open, onClose, title, children, actions }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[1000] w-full max-w-xl rounded-xl bg-white shadow-xl">
        <div className="px-4 py-3 border-b">
          <div className="font-semibold">{title ?? "Edit"}</div>
        </div>
        <div className="p-4">{children}</div>
        <div className="px-4 py-3 border-t flex justify-end gap-2">
          {actions}
        </div>
      </div>
    </div>
  );
}
