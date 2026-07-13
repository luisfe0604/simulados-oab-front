"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useSession } from "./SessionProvider";
import styles from "./AppShell.module.css";
import {
  IconPanel,
  IconExam,
  IconHistory,
  IconAccount,
  IconNewQuestion,
  IconAdmin,
  IconMenu,
  IconLogout,
  JurisLogo,
} from "./icons";

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const MAIN_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Painel", icon: <IconPanel /> },
  { href: "/simulado", label: "Simulados", icon: <IconExam /> },
  { href: "/historico", label: "Histórico", icon: <IconHistory /> },
  { href: "/conta", label: "Conta", icon: <IconAccount /> },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/questao", label: "Nova questão", icon: <IconNewQuestion /> },
  { href: "/dash-admin", label: "Painel admin", icon: <IconAdmin /> },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  const initial = (session.name || session.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  const renderLink = ({ href, label, icon }: NavLink) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
        onClick={() => setOpen(false)}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <span className={styles.brandMark} style={{ color: "var(--rubi)" }}>
            <JurisLogo size={34} />
          </span>
          <span>
            <span className={styles.brandName}>JurisAprova</span>
            <span className={styles.brandSub}>Simulados OAB</span>
          </span>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>Estudo</div>
          {MAIN_LINKS.map(renderLink)}

          {session.is_admin && (
            <>
              <div className={styles.navSection}>Administração</div>
              {ADMIN_LINKS.map(renderLink)}
            </>
          )}
        </nav>

        <div className={styles.userBox}>
          <div className={styles.userRow}>
            <span className={styles.avatar}>{initial}</span>
            <span style={{ minWidth: 0 }}>
              <span className={styles.userName} style={{ display: "block" }}>
                {session.name || "Candidato(a)"}
              </span>
              <span className={styles.userMail} style={{ display: "block" }}>
                {session.email}
              </span>
            </span>
          </div>
          <button className={styles.logout} onClick={handleLogout}>
            <IconLogout />
            Sair da conta
          </button>
          <p className={styles.help}>
            Dúvidas:{" "}
            <a href="mailto:contato.jurisaprova@gmail.com?subject=Ajuda&body=Olá, preciso de suporte">
              contato.jurisaprova@gmail.com
            </a>
          </p>
        </div>
      </aside>

      {open && (
        <div className={styles.backdropOpen} onClick={() => setOpen(false)} />
      )}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.hamburger}
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <IconMenu />
          </button>
          <span style={{ color: "var(--rubi)", display: "inline-flex" }}>
            <JurisLogo size={26} />
          </span>
          <span className={styles.brandName} style={{ fontSize: "1.2rem" }}>
            JurisAprova
          </span>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
