import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

export default async function Sidebar({ open }) {
  const navigate = useNavigate();

  const sub = await apiFetch("/billing/subscription");

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }
  return (
    <>
      <div className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <div>
          <h2 className={styles.logo}>JurisAprova</h2>

          <nav className={styles.nav}>
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/simulado" label="Novo Simulado" />
            <NavItem to="/historico" label="Histórico" />
            <NavItem to="/conta" label="Conta" />
            {sub?.is_admin && (<NavItem to="/questao" label="Nova Questão" />)}
          </nav>
        </div>

        <div>
          <span className={styles.modeDescription}>
            Dúvidas:{" "}
            <a href="mailto:contato.jurisaprova@gmail.com?subject=Ajuda&body=Olá, preciso de suporte">
              contato.jurisaprova@gmail.com
            </a>
          </span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? `${styles.link} ${styles.active}` : styles.link
      }
      onClick={() => setOpen(false)}
    >
      {label}
    </NavLink>
  );
}
