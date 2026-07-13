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

// Marca: balança da justiça (JurisAprova). Usa currentColor para se adaptar ao
// fundo (rubi na sidebar clara, creme sobre o hero rubi).
export const JurisLogo = ({ size = 30 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* haste, base e travessão */}
    <circle cx="16" cy="5.4" r="1.3" fill="currentColor" stroke="none" />
    <path d="M16 6.7V25.5" />
    <path d="M10.5 25.5h11" />
    <path d="M6 9.5h20" />
    {/* cordas dos pratos */}
    <path d="M6 9.5 3 15M6 9.5 9 15M26 9.5 23 15M26 9.5 29 15" />
    {/* pratos */}
    <path d="M2.6 15Q6 19 9.4 15" />
    <path d="M22.6 15Q26 19 29.4 15" />
  </svg>
);
