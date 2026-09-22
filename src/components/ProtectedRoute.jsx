import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { authClient } from "../lib/neonAuth";

function ProtectedRoute() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const result =
          await authClient.getSession();

        console.log(
          "NEON SESSION:",
          result
        );

        if (!active) {
          return;
        }

        setSession(
          result?.data || null
        );
      } catch (error) {
        console.error(
          "Erro ao verificar sessão:",
          error
        );

        if (active) {
          setSession(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <p className="text-gray-500">
          A carregar...
        </p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;