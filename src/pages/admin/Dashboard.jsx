import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getDashboardData } from "../../services/dashboard";

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    stats: {
      pending: 0,
      today: 0,
      clients: 0,
      services: 0,
    },
    upcoming: [],
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getDashboardData();

      setDashboard(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Não foi possível carregar os dados do Dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main>
        <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
          <p className="text-gray-500">
            A carregar Dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main>
        <div className="bg-red-50 text-red-600 rounded-2xl p-6">
          <p>{errorMessage}</p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 font-semibold underline"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  const stats = [
    {
      label: "Pedidos pendentes",
      value: dashboard.stats.pending,
      link: "/admin/pedidos",
    },
    {
      label: "Marcações hoje",
      value: dashboard.stats.today,
      link: "/admin/agenda",
    },
    {
      label: "Clientes",
      value: dashboard.stats.clients,
      link: "/admin/clientes",
    },
    {
      label: "Serviços ativos",
      value: dashboard.stats.services,
      link: "/admin/servicos",
    },
  ];

  return (
    <main>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
        <div>
          <h1 className="title text-4xl text-[#3D3D3D]">
            Olá, Mónica 👋
          </h1>

          <p className="text-gray-500 mt-2">
            Aqui está o resumo da sua agenda.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="bg-white border border-[#ECE6E2] px-5 py-3 rounded-2xl hover:border-[#C8A96A] transition"
        >
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white rounded-3xl shadow-sm p-6 hover:-translate-y-1 hover:shadow-md transition"
          >
            <p className="text-gray-500">
              {stat.label}
            </p>

            <p className="text-5xl font-bold text-[#C8A96A] mt-3">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <section className="bg-white rounded-3xl shadow-sm p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="title text-2xl text-[#3D3D3D]">
              Próximas marcações
            </h2>

            <p className="text-gray-500 mt-1">
              As próximas marcações confirmadas.
            </p>
          </div>

          <Link
            to="/admin/agenda"
            className="text-[#C8A96A] font-semibold hover:underline"
          >
            Ver agenda completa
          </Link>
        </div>

        <div className="space-y-4">
          {dashboard.upcoming.map((booking) => {
            const services =
              booking.booking_services || [];

            return (
              <Link
                key={booking.id}
                to={`/admin/pedido/${booking.id}`}
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-[#F0ECE8] rounded-2xl p-5 hover:border-[#C8A96A] transition"
              >
                <div>
                  <p className="font-semibold text-[#3D3D3D]">
                    {booking.client_name}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {services.length > 0
                      ? services
                          .map(
                            (service) =>
                              service.service_name
                          )
                          .join(" • ")
                      : "Sem serviços"}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="font-semibold text-[#C8A96A]">
                    {formatDate(booking.booking_date)}
                  </p>

                  <p className="text-sm text-gray-500">
                    {booking.booking_time?.slice(0, 5)} ·{" "}
                    {booking.total_duration} min
                  </p>
                </div>
              </Link>
            );
          })}

          {dashboard.upcoming.length === 0 && (
            <div className="bg-[#FAF8F6] rounded-2xl p-8 text-center">
              <p className="text-gray-500">
                Não existem próximas marcações confirmadas.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Dashboard;