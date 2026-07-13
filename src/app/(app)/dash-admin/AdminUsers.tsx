"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import styles from "./dash-admin.module.css";

interface AdminUser {
  id: number;
  name: string | null;
  email: string;
  plan: string | null;
  subscription_status: string | null;
  is_admin: boolean;
  created_at: string | null;
}
interface UsersResponse {
  total: number;
  page: number;
  limit: number;
  users: AdminUser[];
}

const LIMIT = 10;

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    const q = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (search) q.set("search", search);
    const data = await api.get<UsersResponse>(`/users?${q}`);
    setUsers(data.users);
    setTotal(data.total);
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: number, fn: () => Promise<unknown>) {
    setBusy(id);
    try {
      await fn();
      await load();
    } finally {
      setBusy(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHead}>
        <h3 className={styles.chartTitle} style={{ margin: 0 }}>
          Usuários
        </h3>
        <input
          className={`input ${styles.search}`}
          placeholder="Buscar por nome ou e-mail…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.users}>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Status</th>
              <th>Plano</th>
              <th>Desde</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <span className={styles.uname} style={{ display: "block" }}>
                    {u.name || "—"}
                    {u.is_admin && (
                      <span className="badge badge-rubi" style={{ marginLeft: 8 }}>
                        admin
                      </span>
                    )}
                  </span>
                  <span className={styles.umail}>{u.email}</span>
                </td>
                <td>{u.subscription_status || "—"}</td>
                <td>{u.plan === "premium" ? "Premium" : "Gratuito"}</td>
                <td className="mono" style={{ fontSize: "0.8rem", color: "var(--ink-faint)" }}>
                  {formatDate(u.created_at)}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.miniBtn}
                      disabled={busy === u.id}
                      onClick={() =>
                        act(u.id, () => api.patch(`/users/${u.id}/premium`))
                      }
                    >
                      Premium
                    </button>
                    <button
                      className={styles.miniBtn}
                      disabled={busy === u.id}
                      onClick={() =>
                        act(u.id, () => api.patch(`/users/${u.id}/free`))
                      }
                    >
                      Gratuito
                    </button>
                    <button
                      className={styles.miniBtn}
                      disabled={busy === u.id}
                      onClick={() =>
                        act(u.id, () => api.patch(`/users/${u.id}/admin`))
                      }
                    >
                      {u.is_admin ? "Remover admin" : "Tornar admin"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--ink-faint)" }}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pager}>
        <button
          className={styles.miniBtn}
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Anterior
        </button>
        <span className={styles.pagerInfo}>
          Página {page} de {totalPages} · {total} usuários
        </span>
        <button
          className={styles.miniBtn}
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
