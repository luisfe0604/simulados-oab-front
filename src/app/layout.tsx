import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simulados OAB",
  description: "Plataforma de simulados para o Exame de Ordem da OAB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
