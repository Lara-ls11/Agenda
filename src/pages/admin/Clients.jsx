import { useEffect, useMemo, useState } from "react";

import { getClients } from "../../services/clients";

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-PT").format(
    new Date(`${dateString}T12:00:00`)
  );
}

function Clients() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getClients();

      setBookings(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Não foi possível carregar as clientes."
      );
    } finally {
      setLoading(false);
    }
  }

  const clients = useMemo(() => {
    const clientsMap = new Map();

    bookings.forEach((booking) => {
      const key =
        booking.phone ||
        booking.email ||
        String(booking.id);

      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          id: key,
          name: booking.client_name,
          phone: booking.phone,
          email: booking.email,
          totalBookings: 0,
          acceptedBookings: 0,
          pendingBookings: 0,
          lastBooking: booking.booking_date,
          services: new Set(),
        });
      }

      const client = clientsMap.get(key);

      client.totalBookings += 1;

      if (booking.status === "accepted") {
        client.acceptedBookings += 1;
      }

      if (booking.status === "pending") {
        client.pendingBookings += 1;
      }

      const bookingServices =
        booking.booking_services || [];

      bookingServices.forEach((service) => {
        client.services.add(service.service_name);
      });

      if (
        booking.booking_date &&
        booking.booking_date > client.lastBooking
      ) {
        client.lastBooking =
          booking.booking_date;
      }
    });

    return Array.from(
      clientsMap.values()
    ).map((client) => ({
      ...client,
      services: Array.from(
        client.services
      ),
    }));
  }, [bookings]);

  const filteredClients = clients.filter(
    (client) => {
      const term =
        search.toLowerCase().trim();

      if (!term) {
        return true;
      }

      return (
        client.name
          ?.toLowerCase()
          .includes(term) ||
        client.phone?.includes(term) ||
        client.email
          ?.toLowerCase()
          .includes(term)
      );
    }
  );

  if (loading) {
    return (
      <main>
        <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
          <p className="text-gray-500">
            A carregar clientes...
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
            onClick={loadClients}
            className="mt-4 font-semibold underline"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="title text-4xl text-[#3D3D3D]">
            Clientes
          </h1>

          <p className="text-gray-500 mt-2">
            Consulte os contactos e o histórico de marcações.
          </p>
        </div>

        <button
          type="button"
          onClick={loadClients}
          className="bg-white border border-[#ECE6E2] px-5 py-3 rounded-2xl hover:border-[#C8A96A] transition"
        >
          Atualizar
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-5 mb-8">
        <input
          type="text"
          placeholder="Pesquisar por nome, telemóvel ou email"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
        />
      </div>

      <div className="space-y-5">
        {filteredClients.map((client) => (
          <article
            key={client.id}
            className="bg-white rounded-3xl shadow-sm p-6"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#3D3D3D]">
                  {client.name}
                </h2>

                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="block text-[#C8A96A] mt-1 hover:underline"
                  >
                    {client.phone}
                  </a>
                )}

                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="block text-gray-500 mt-1 hover:underline"
                  >
                    {client.email}
                  </a>
                )}
              </div>

              <div className="sm:text-right">
                <p className="text-sm text-gray-500">
                  Total de marcações
                </p>

                <p className="text-3xl font-bold text-[#C8A96A]">
                  {client.totalBookings}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 mt-6 pt-5">
              <div>
                <p className="text-sm text-gray-500">
                  Última marcação
                </p>

                <p className="font-medium text-[#3D3D3D] mt-1">
                  {formatDate(client.lastBooking)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Confirmadas
                </p>

                <p className="font-semibold text-green-600 mt-1">
                  {client.acceptedBookings}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Pendentes
                </p>

                <p className="font-semibold text-yellow-600 mt-1">
                  {client.pendingBookings}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm text-gray-500 mb-3">
                Serviços já marcados
              </p>

              <div className="flex flex-wrap gap-2">
                {client.services.map(
                  (service) => (
                    <span
                      key={service}
                      className="bg-[#FAF8F6] text-[#3D3D3D] px-3 py-2 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  )
                )}

                {client.services.length ===
                  0 && (
                  <span className="text-gray-500">
                    Sem serviços registados.
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}

        {filteredClients.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
            <p className="text-gray-500">
              Não foi encontrada nenhuma cliente.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Clients;