import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Simulado from "./pages/Simulado";
import Historico from "./pages/Historico";
import Login from "./pages/Login";
import AuthSuccess from "./pages/AuthSuccess";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth-success" element={<AuthSuccess />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/simulado" element={<Simulado />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/simulado/refazer/:id" element={<Simulado />} />
      </Route>
    </Routes>
  );
}
