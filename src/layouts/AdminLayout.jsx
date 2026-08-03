import { useState } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
} from "react-router-dom";

import logo from "../assets/logo.png";
import { supabase } from "../lib/supabase";

function AdminLayout() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] =
    useState(false);

  async function logout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      alert(
        "Não foi possível terminar a sessão."
      );
      return;
    }

    setMenuOpen(false);

    navigate("/admin", {
      replace: true,
    });
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function linkClass({ isActive }) {
    return `block px-4 py-3 rounded-xl transition ${
      isActive
        ? "bg-[#F5F0EA] text-[#A88642] font-semibold"
        : "text-[#3D3D3D] hover:bg-[#F5F0EA]"
    }`;
  }

  function NavigationLinks() {
    return (
      <nav className="p-5 space-y-2">
        <NavLink
          to="/admin/dashboard"
          className={linkClass}
          onClick={closeMenu}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/pedidos"
          className={linkClass}
          onClick={closeMenu}
        >
          Pedidos Pendentes
        </NavLink>

        <NavLink
          to="/admin/agenda"
          className={linkClass}
          onClick={closeMenu}
        >
          Agenda
        </NavLink>

        <NavLink
          to="/admin/clientes"
          className={linkClass}
          onClick={closeMenu}
        >
          Clientes
        </NavLink>

        <NavLink
          to="/admin/servicos"
          className={linkClass}
          onClick={closeMenu}
        >
          Serviços
        </NavLink>

        <NavLink
          to="/admin/definicoes"
          className={linkClass}
          onClick={closeMenu}
        >
          Definições
        </NavLink>
      </nav>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F6]">
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-[#ECE6E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() =>
                setMenuOpen(true)
              }
              aria-label="Abrir menu"
              className="lg:hidden flex-shrink-0 w-10 h-10 rounded-xl border border-[#ECE6E2] bg-white flex items-center justify-center text-[#3D3D3D] hover:bg-[#F5F0EA] transition"
            >
              <span className="flex flex-col gap-1">
                <span className="block w-5 h-0.5 bg-current rounded-full" />
                <span className="block w-5 h-0.5 bg-current rounded-full" />
                <span className="block w-5 h-0.5 bg-current rounded-full" />
              </span>
            </button>

            <img
              src={logo}
              alt="Mónica Lima"
              className="w-10 sm:w-12 flex-shrink-0"
            />

            <div className="min-w-0">
              <h1 className="title text-xl sm:text-2xl text-[#3D3D3D] truncate">
                Mónica Lima
              </h1>

              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Área de Administração
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="hidden sm:block text-sm text-red-500 hover:text-red-700 transition"
          >
            Terminar sessão
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        <aside className="hidden lg:block w-64 flex-shrink-0 bg-white min-h-[calc(100vh-81px)] border-r border-[#ECE6E2]">
          <NavigationLinks />
        </aside>

        <section className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </section>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/35"
          />

          <aside className="relative h-full w-[82%] max-w-xs bg-white shadow-2xl flex flex-col animate-[slideIn_.2s_ease-out]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ECE6E2]">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={logo}
                  alt="Mónica Lima"
                  className="w-11 flex-shrink-0"
                />

                <div className="min-w-0">
                  <p className="title text-xl text-[#3D3D3D] truncate">
                    Mónica Lima
                  </p>

                  <p className="text-xs text-gray-500">
                    Administração
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                aria-label="Fechar menu"
                className="w-9 h-9 rounded-xl border border-[#ECE6E2] flex items-center justify-center text-2xl leading-none text-[#3D3D3D]"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <NavigationLinks />
            </div>

            <div className="p-5 border-t border-[#ECE6E2]">
              <button
                type="button"
                onClick={logout}
                className="w-full border border-red-200 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 transition"
              >
                Terminar sessão
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default AdminLayout;