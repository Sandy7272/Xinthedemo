"use client";

/**
 * Self-contained SVG figure used for the virtual try-on before/after preview.
 * No external images — a stylised, neutral mannequin so nothing reads as fake
 * branding. `styled` swaps the plain outfit for a product "look".
 */
export function TryOnScene({ styled }: { styled: boolean }) {
  const top = styled ? "#3366ff" : "#c4c9d2";
  const topShade = styled ? "#1f47f5" : "#aeb4bf";
  const pants = styled ? "#2b2f38" : "#9aa0ac";
  const shoes = styled ? "#0a0a0b" : "#3f434c";

  return (
    <svg
      viewBox="0 0 360 460"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={styled ? "Figure wearing the styled product" : "Figure in original clothing"}
    >
      <defs>
        <linearGradient id="tryon-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={styled ? "#eef4ff" : "#f5f6f9"} />
          <stop offset="100%" stopColor={styled ? "#e4ecff" : "#e9ebf0"} />
        </linearGradient>
        <radialGradient id="tryon-spot" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="360" height="460" fill="url(#tryon-bg)" />
      <rect width="360" height="460" fill="url(#tryon-spot)" />

      {/* floor shadow */}
      <ellipse cx="180" cy="424" rx="92" ry="16" fill="#0a0a0b" opacity="0.08" />

      {/* legs */}
      <rect x="150" y="286" width="26" height="130" rx="13" fill={pants} />
      <rect x="184" y="286" width="26" height="130" rx="13" fill={pants} />
      <rect x="146" y="410" width="34" height="18" rx="9" fill={shoes} />
      <rect x="180" y="410" width="34" height="18" rx="9" fill={shoes} />

      {/* arms (garment sleeves + hands) */}
      <rect x="96" y="150" width="26" height="118" rx="13" fill={top} />
      <rect x="238" y="150" width="26" height="118" rx="13" fill={top} />
      <circle cx="109" cy="276" r="12" fill="#d7cabc" />
      <circle cx="251" cy="276" r="12" fill="#d7cabc" />

      {/* torso / top garment */}
      <path
        d="M126 150 q54 -30 108 0 l6 118 q-60 22 -120 0 Z"
        fill={top}
      />
      <path d="M180 150 v118" stroke={topShade} strokeWidth="3" opacity="0.7" />
      {/* collar */}
      <path d="M162 148 l18 18 l18 -18 Z" fill={topShade} />

      {/* neck + head */}
      <rect x="170" y="120" width="20" height="26" rx="8" fill="#d7cabc" />
      <circle cx="180" cy="96" r="34" fill="#e0d4c6" />
      {/* hair */}
      <path d="M148 92 q4 -34 32 -34 q28 0 32 34 q-16 -14 -32 -14 q-16 0 -32 14 Z" fill="#413b35" />

      {/* styled-only accessories */}
      {styled && (
        <>
          {/* cap */}
          <path d="M147 78 q6 -30 33 -30 q27 0 33 30 q-33 -12 -66 0 Z" fill="#0a0a0b" />
          <rect x="176" y="72" width="40" height="8" rx="4" fill="#0a0a0b" />
          {/* crossbody strap */}
          <path d="M150 156 L214 250" stroke="#e5484d" strokeWidth="7" strokeLinecap="round" />
          <rect x="206" y="242" width="26" height="20" rx="6" fill="#e5484d" />
        </>
      )}
    </svg>
  );
}
