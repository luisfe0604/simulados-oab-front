import { redirect } from "next/navigation";

// Raiz → dashboard. O middleware redireciona visitantes sem sessão para /login.
export default function Home() {
  redirect("/dashboard");
}
