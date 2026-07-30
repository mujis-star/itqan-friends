"use client";
import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon = <FolderOpen size={32} className="text-gray-500" />,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="glass-card p-12 rounded-2xl text-center flex flex-col items-center justify-center max-w-lg mx-auto border border-white/5 space-y-4">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-slate-950 font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
