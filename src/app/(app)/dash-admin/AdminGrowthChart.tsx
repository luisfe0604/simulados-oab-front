"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./dash-admin.module.css";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function label(month: string) {
  const [, m] = month.split("-");
  return MONTHS[Number(m) - 1] ?? month;
}

export function AdminGrowthChart({
  data,
}: {
  data: { month: string; count: number }[];
}) {
  const chartData = data.map((d) => ({ mes: label(d.month), Cadastros: d.count }));

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Novos cadastros por mês</h3>
      <p className={styles.chartSub}>Evolução da base de usuários ao longo do tempo.</p>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRubi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7B1E2B" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#7B1E2B" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#D9D2C5" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fill: "#7a6f68", fontSize: 12, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={{ stroke: "#D9D2C5" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#7a6f68", fontSize: 12, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#F6F3EC",
                border: "1px solid #D9D2C5",
                borderRadius: 8,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
              }}
              labelStyle={{ color: "#221c1a", fontWeight: 600 }}
              cursor={{ stroke: "#7B1E2B", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="Cadastros"
              stroke="#7B1E2B"
              strokeWidth={2.4}
              fill="url(#fillRubi)"
              dot={{ r: 3, fill: "#7B1E2B" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
