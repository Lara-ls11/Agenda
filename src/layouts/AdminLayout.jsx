import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import logo from "../assets/logo.png";
import { supabase } from "../lib/supabase";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Não foi possível terminar a sessão.");
      return;
    }

    setMenuOpen(false);

    navigate("/admin", {
      replace: true,
    });
  }

  function linkClass({ isActive }) {
    return [
      "block rounded-xl px-4 py-3 text-sm transition",
      isActive
        ? "bg-[#F5F0EA] font-semibold text-[#A88642]"
        : "text-[#3D3D3D] hover:bg-[#FAF8F6]",
    ].join(" ");
  }

  const navigation = (
    <nav className="space-y-2">
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
  );

  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 border-b border-[#ECE6E2] bg-white shadow-sm">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:py-4">
          <div className="flex min-w-0 items-center gap-3">
            {/* Botão visível apenas no telemóvel/tablet */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#ECE6E2] bg-white text-[#3D3D3D] transition hover:bg-[#FAF8F6] lg:hidden"
            >
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>

            <img
              src={logo}
              alt="Mónica Lima"
              className="h-10 w-10 flex-shrink-0 object-contain sm:h-12 sm:w-12"
            />

            <div className="min-w-0">
              <h1 className="title truncate text-xl text-[#3D3D3D] sm:text-2xl">
                Mónica Lima
              </h1>

              <p className="truncate text-xs text-gray-500 sm:text-sm">
                Área de Administração
              </p>
            </div>
          </div>

          {/* No telemóvel fica dentro do menu */}
          <button
            type="button"
            onClick={logout}
            className="hidden flex-shrink-0 text-sm text-red-500 transition hover:text-red-700 sm:block"
          >
            Terminar sessão
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl">
        {/* Sidebar do computador */}
        <aside className="hidden min-h-[calc(100vh-81px)] w-64 flex-shrink-0 border-r border-[#ECE6E2] bg-white lg:block">
          <div className="sticky top-[81px] p-6">
            {navigation}
          </div>
        </aside>

        {/* Conteúdo */}
        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:p-8">
          <Outlet />
        </section>
      </div>

      {/* Menu móvel */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          menuOpen
            ? "pointer-events-auto"
            : "pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Fundo escuro */}
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Fechar menu"
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            menuOpen
              ? "opacity-100"
              : "opacity-0"
          }`}
        />

        {/* Painel lateral */}
        <aside
          className={`absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-white shadow-2xl transition-transform duration-200 ${
            menuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#ECE6E2] px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={logo}
                alt="Mónica Lima"
                className="h-11 w-11 flex-shrink-0 object-contain"
              />

              <div className="min-w-0">
                <p className="title truncate text-xl text-[#3D3D3D]">
                  Mónica Lima
                </p>

                <p className="text-xs text-gray-500">
                  Administração
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar menu"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#ECE6E2] text-2xl leading-none text-[#3D3D3D] transition hover:bg-[#FAF8F6]"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {navigation}
          </div>

          <div className="border-t border-[#ECE6E2] p-5">
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Terminar sessão
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdminLayout;