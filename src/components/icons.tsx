// Ícones inline (sem dependência externa). Traço 1.6, 20x20, currentColor.

type IconProps = { size?: number };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconPanel = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 12 12 4l9 8" />
    <path d="M6 10.5V20h12v-9.5" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const IconExam = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 3h9l5 5v13H5z" />
    <path d="M14 3v5h5" />
    <path d="M8 13h7M8 17h5" />
  </svg>
);

export const IconHistory = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 4v4h4" />
    <path d="M12 8v4l3 2" />
  </svg>
);

export const IconAccount = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
  </svg>
);

export const IconNewQuestion = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 3h9l5 5v13H5z" />
    <path d="M14 3v5h5" />
    <path d="M12 11v6M9 14h6" />
  </svg>
);

export const IconAdmin = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);

export const IconMenu = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const IconLogout = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const IconClock = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconCheck = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconX = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconArrow = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// Marca: anel de rubi (signet). Gema no topo do anel.
export const RubiRing = ({ size = 30 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="19" r="9" stroke="var(--rubi)" strokeWidth="2.4" />
    <path
      d="M16 3.5 20 8l-4 4-4-4z"
      fill="var(--rubi)"
      stroke="var(--rubi-deep)"
      strokeWidth="0.6"
      strokeLinejoin="round"
    />
    <path d="M12 8h8l-4 4z" fill="var(--rubi-bright)" opacity="0.85" />
  </svg>
);
