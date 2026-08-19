import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getPendingBookings } from "../../services/bookings";

function formatDate(dateString) {
  if (!dateString) return "";

  return new Intl.DateTimeFormat("pt-PT").format(
    new Date(`${dateString}T12:00:00`)
  );
}

function PendingBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getPendingBookings();

      setBookings(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Não foi possível carregar os pedidos pendentes."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="mb-8">
        <h1 className="title text-4xl text-[#3D3D3D]">
          Pedidos Pendentes
        </h1>
      </div>

      {loading && (
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          <p className="text-gray-500">
            A carregar pedidos...
          </p>
        </div>
      )}

      {!loading && errorMessage && (
        <div className="bg-red-50 text-red-600 rounded-2xl p-5">
          <p>{errorMessage}</p>

          <button
            type="button"
            onClick={loadBookings}
            className="mt-4 font-semibold underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !errorMessage && (
        <div className="space-y-5">
          {bookings.map((booking) => {
            const services =
              booking.booking_services || [];

            return (
              <article
                key={booking.id}
                className="bg-white rounded-3xl shadow-sm p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#3D3D3D]">
                      {booking.client_name}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {formatDate(booking.booking_date)} •{" "}
                      {booking.booking_time?.slice(0, 5)}
                    </p>
                  </div>

                  <span className="self-start bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium">
                    Pendente
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  <p className="text-gray-600">
                    <strong>Serviços:</strong>{" "}
                    {services.length > 0
                      ? services
                          .map(
                            (service) =>
                              service.service_name
                          )
                          .join(" • ")
                      : "Sem serviços associados"}
                  </p>

                  <p className="text-gray-600">
                    <strong>Duração:</strong>{" "}
                    {booking.total_duration} minutos
                  </p>

                  <p className="text-gray-600">
                    <strong>Telemóvel:</strong>{" "}
                    {booking.phone}
                  </p>
                </div>

                <Link
                  to={`/admin/pedido/${booking.id}`}
                  className="block text-center mt-6 w-full bg-[#C8A96A] text-white py-3 rounded-2xl hover:opacity-90 transition"
                >
                  Ver Pedido
                </Link>
              </article>
            );
          })}

          {bookings.length === 0 && (
            <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
              <p className="text-gray-500">
                Não existem pedidos pendentes.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default PendingBookings;