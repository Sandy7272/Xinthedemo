"use client";

import { useEffect, useState, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useViewerSettings, type PerfStats } from "../viewer-settings-context";
import { ToggleRow } from "./controls";

/**
 * Performance instrumentation, split in three pieces:
 *  - PerfTracker  — inside the Canvas; samples renderer.info + FPS into a
 *    mutable ref every 500 ms (zero React state per frame → zero overhead).
 *  - PerfOverlay  — DOM overlay on the viewer showing the live numbers.
 *  - PerformancePanel — inspector section with the overlay toggle + stats.
 */

const SAMPLE_MS = 500;

export function PerfTracker({
  statsRef,
}: {
  statsRef: MutableRefObject<PerfStats>;
}) {
  const gl = useThree((s) => s.gl);

  useFrame(() => {
    const s = statsRef.current;
    const now = performance.now();
    if (s.last === 0) s.last = now;
    s.frames += 1;
    if (now - s.last < SAMPLE_MS) return;

    s.fps = Math.round((s.frames * 1000) / (now - s.last));
    s.frames = 0;
    s.last = now;
    // renderer.info holds the totals of the last completed frame — with the
    // EffectComposer active this includes every post pass (true GPU cost).
    s.calls = gl.info.render.calls;
    s.triangles = gl.info.render.triangles;
    s.geometries = gl.info.memory.geometries;
    s.textures = gl.info.memory.textures;
    const mem = (
      performance as Performance & { memory?: { usedJSHeapSize: number } }
    ).memory;
    s.memoryMB = mem ? mem.usedJSHeapSize / 1048576 : null;
  });

  return null;
}

/** Polls the shared stats ref — cheap, and only mounted while visible. */
function usePerfSample(statsRef: MutableRefObject<PerfStats>) {
  const [sample, setSample] = useState<PerfStats>(statsRef.current);
  useEffect(() => {
    const id = window.setInterval(
      () => setSample({ ...statsRef.current }),
      SAMPLE_MS,
    );
    return () => window.clearInterval(id);
  }, [statsRef]);
  return sample;
}

const fmt = new Intl.NumberFormat("en-US");

function StatRows({ stats }: { stats: PerfStats }) {
  const rows: [string, string][] = [
    ["FPS", String(stats.fps)],
    ["Triangles", fmt.format(stats.triangles)],
    ["Draw calls", String(stats.calls)],
    ["Geometries", String(stats.geometries)],
    ["Textures", String(stats.textures)],
    ["JS heap", stats.memoryMB !== null ? `${stats.memoryMB.toFixed(0)} MB` : "n/a"],
  ];
  return (
    <>
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3">
          <span>{label}</span>
          <span className="font-semibold tabular-nums">{value}</span>
        </div>
      ))}
    </>
  );
}

/** Small monospace stats card overlaid on the viewer (top-right). */
export function PerfOverlay({
  statsRef,
}: {
  statsRef: MutableRefObject<PerfStats>;
}) {
  const stats = usePerfSample(statsRef);
  return (
    <div className="absolute right-3 top-16 z-10 w-[148px] space-y-1 rounded-xl border border-line bg-white/90 p-2.5 font-mono text-[10px] leading-4 text-ink-soft shadow-card backdrop-blur-xl">
      <StatRows stats={stats} />
    </div>
  );
}

/** Inspector section body: overlay toggle + the same live numbers inline. */
export function PerformancePanel() {
  const { showPerf, setShowPerf, perfRef } = useViewerSettings();
  const stats = usePerfSample(perfRef);

  return (
    <>
      <ToggleRow
        label="Stats overlay"
        hint="Pin live stats onto the viewer"
        checked={showPerf}
        onChange={setShowPerf}
      />
      <div className="space-y-1.5 rounded-xl border border-line bg-surface-subtle p-3 font-mono text-[11px] text-ink-soft">
        <StatRows stats={stats} />
      </div>
    </>
  );
}
