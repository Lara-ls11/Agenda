import {
  Outlet,
  NavLink,
  useNavigate,
} from "react-router-dom";
import logo from "../assets/logo.png";
import { supabase } from "../lib/supabase";

function AdminLayout() {
  const navigate = useNavigate();

  async function logout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      alert(
        "Não foi possível terminar a sessão."
      );
      return;
    }

    navigate("/admin", {
      replace: true,
    });
  }

  function linkClass({ isActive }) {
    return `block px-4 py-3 rounded-xl transition ${
      isActive
        ? "bg-[#F5F0EA] text-[#A88642] font-semibold"
        : "text-[#3D3D3D] hover:bg-[#F5F0EA]"
    }`;
  }

  return (
    <main className="min-h-screen bg-[#FAF8F6]">
      <header className="bg-white shadow-sm border-b border-[#ECE6E2]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Mónica Lima"
              className="w-12"
            />

            <div>
              <h1 className="title text-2xl text-[#3D3D3D]">
                Mónica Lima
              </h1>

              <p className="text-sm text-gray-500">
                Área de Administração
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700 transition"
          >
            Terminar sessão
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        <aside className="w-64 bg-white min-h-[calc(100vh-81px)] border-r border-[#ECE6E2]">
          <nav className="p-6 space-y-2">
            <NavLink
              to="/admin/dashboard"
              className={linkClass}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/pedidos"
              className={linkClass}
            >
              Pedidos Pendentes
            </NavLink>

            <NavLink
              to="/admin/agenda"
              className={linkClass}
            >
              Agenda
            </NavLink>

            <NavLink
              to="/admin/clientes"
              className={linkClass}
            >
              Clientes
            </NavLink>

            <NavLink
              to="/admin/servicos"
              className={linkClass}
            >
              Serviços
            </NavLink>

            <NavLink
              to="/admin/definicoes"
              className={linkClass}
            >
              Definições
            </NavLink>
          </nav>
        </aside>

        <section className="flex-1 p-8 min-w-0">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

export default AdminLayout;