import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { supabase } from "../../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setLoading(false);

    if (error) {
      setErrorMessage(
        "Email ou palavra-passe incorretos."
      );
      return;
    }

    navigate("/admin/dashboard", {
      replace: true,
    });
  }

  return (
    <main className="min-h-screen bg-[#FAF8F6] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <img
          src={logo}
          alt="Mónica Lima"
          className="w-24 mx-auto mb-6"
        />

        <h1 className="title text-4xl text-center text-[#3D3D3D] mb-2">
          Área de Administração
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Inicie sessão para gerir as marcações.
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label className="block mb-2 text-sm text-gray-600">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-600">
              Palavra-passe
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
            />
          </div>

          {errorMessage && (
            <p className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold transition ${
              loading
                ? "bg-gray-300 text-gray-500"
                : "bg-[#C8A96A] text-white hover:opacity-90"
            }`}
          >
            {loading
              ? "A entrar..."
              : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Login;