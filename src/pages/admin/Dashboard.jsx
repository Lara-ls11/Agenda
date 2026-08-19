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

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
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

      let data;

      try {
        data = await getDashboardData();
      } catch (firstError) {
        console.warn(
          "Primeira tentativa falhou. A repetir...",
          firstError
        );

        await wait(700);

        data = await getDashboardData();
      }

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
      <main className="w-full min-w-0">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm px-5 py-10 text-center">
          <p className="text-sm sm:text-base text-gray-500">
            A carregar Dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="w-full min-w-0">
        <div className="bg-red-50 text-red-600 rounded-2xl p-5 sm:p-6">
          <p className="text-sm sm:text-base">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 text-sm sm:text-base font-semibold underline"
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
    <main className="w-full min-w-0">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between mb-7 sm:mb-10">
        <div className="min-w-0">
          <h1 className="title text-3xl sm:text-4xl text-[#3D3D3D] leading-tight">
            Olá, Mónica
          </h1>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="w-full sm:w-auto bg-white border border-[#ECE6E2] px-5 py-3 rounded-2xl text-sm font-medium hover:border-[#C8A96A] transition"
        >
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 mb-7 sm:mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="min-w-0 bg-white rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6 hover:-translate-y-1 hover:shadow-md transition"
          >
            <p className="text-xs sm:text-sm lg:text-base text-gray-500 leading-snug">
              {stat.label}
            </p>

            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#C8A96A] mt-2 sm:mt-3">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <section className="min-w-0 bg-white rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6">
          <div className="min-w-0">
            <h2 className="title text-2xl sm:text-3xl text-[#3D3D3D] leading-tight">
              Próximas marcações
            </h2>

            <p className="text-sm sm:text-base text-gray-500 mt-1">
              As próximas marcações confirmadas.
            </p>
          </div>

          <Link
            to="/admin/agenda"
            className="self-start text-sm sm:text-base text-[#C8A96A] font-semibold hover:underline"
          >
            Ver agenda completa
          </Link>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {dashboard.upcoming.map((booking) => {
            const services =
              booking.booking_services || [];

            return (
              <Link
                key={booking.id}
                to={`/admin/pedido/${booking.id}`}
                className="block min-w-0 border border-[#F0ECE8] rounded-2xl p-4 sm:p-5 hover:border-[#C8A96A] transition"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#3D3D3D] truncate">
                      {booking.client_name}
                    </p>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 sm:line-clamp-1">
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

                  <div className="flex flex-col gap-1 sm:flex-shrink-0 sm:text-right">
                    <p className="font-semibold text-[#C8A96A]">
                      {formatDate(
                        booking.booking_date
                      )}
                    </p>

                    <p className="text-sm text-gray-500">
                      {booking.booking_time?.slice(0, 5)}
                      {" · "}
                      {booking.total_duration} min
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}

          {dashboard.upcoming.length === 0 && (
            <div className="bg-[#FAF8F6] rounded-2xl px-5 py-8 text-center">
              <p className="text-sm sm:text-base text-gray-500">
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