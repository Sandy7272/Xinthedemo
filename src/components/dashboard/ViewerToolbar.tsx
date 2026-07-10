"use client";

import {
  RotateCw,
  Move,
  ZoomIn,
  Grid3x3,
  Layers,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { useStudio } from "./studio-context";
import { cn } from "@/lib/cn";

function ToolButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={active}
      className={cn(
        "flex w-full flex-col items-center gap-1 rounded-xl px-1.5 py-2 transition-colors",
        active
          ? "bg-brand-500 text-white shadow-soft"
          : "text-ink-muted hover:bg-surface-muted hover:text-ink",
      )}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      <span className="text-[9px] font-medium leading-none">{label}</span>
    </button>
  );
}

/** Vertical toolbar overlaid on the left of the 3D viewer. */
export function ViewerToolbar() {
  const { toggles, toggle } = useStudio();

  return (
    <div className="absolute left-3 top-3 z-10 flex w-[52px] flex-col gap-1 rounded-2xl border border-line bg-white/90 p-1.5 shadow-card backdrop-blur-xl">
      <ToolButton
        icon={RotateCw}
        label="Rotate"
        active={toggles.autoRotate}
        onClick={() => toggle("autoRotate")}
      />
      <ToolButton
        icon={Move}
        label="Pan"
        active={toggles.pan}
        onClick={() => toggle("pan")}
      />
      <ToolButton
        icon={ZoomIn}
        label="Zoom"
        active={toggles.zoom}
        onClick={() => toggle("zoom")}
      />
      <ToolButton
        icon={Grid3x3}
        label="Wire"
        active={toggles.wireframe}
        onClick={() => toggle("wireframe")}
      />
      <ToolButton
        icon={Layers}
        label="Texture"
        active={toggles.textures}
        onClick={() => toggle("textures")}
      />
      <ToolButton
        icon={Globe}
        label="HDRI"
        active={!toggles.studio}
        onClick={() => toggle("studio")}
      />
    </div>
  );
}
