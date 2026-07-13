import type { Metadata } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Display: serifa editorial com personalidade (wordmark, títulos).
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// UI/corpo: grotesca limpa para toda a interface.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Dados: cronômetro, notas, numeração de questões.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JurisAprova — Simulados OAB",
  description:
    "Plataforma de simulados para a 1ª fase do Exame de Ordem. Pratique, corrija e acompanhe sua evolução até a aprovação.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
