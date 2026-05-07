"use client";

interface CategoriaTagProps {
  name: string;
  icon: string;
  color: string;
  isActive?: boolean;
}

export default function CategoriaTag({ name, icon, color, isActive = true }: CategoriaTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-opacity ${
        isActive ? "" : "opacity-40"
      }`}
      style={{ backgroundColor: color + "20", color: color }}
    >
      <span>{icon}</span>
      <span>{name}</span>
    </span>
  );
}
