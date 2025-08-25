"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  );
}

export function ModalContent({ className, children }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-2xl border p-0 overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ModalHeader({ className, children }) {
  return (
    <div className={cn("p-6 border-b", className)}>
      {children}
    </div>
  );
}

export function ModalTitle({ className, children }) {
  return (
    <h3 className={cn("text-xl font-semibold", className)}>{children}</h3>
  );
}

export function ModalFooter({ className, children }) {
  return (
    <div className={cn("p-6 border-t", className)}>
      {children}
    </div>
  );
}


