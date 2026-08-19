import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deleteClient,
  getClients,
  updateClient,
} from "../../services/clients";

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "pt-PT"
  ).format(
    new Date(
      `${dateString}T12:00:00`
    )
  );
}

function Clients() {
  const [bookings, setBookings] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    editingClient,
    setEditingClient,
  ] = useState(null);

  const [editForm, setEditForm] =
    useState({
      name: "",
      phone: "",
      email: "",
    });

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data =
        await getClients();

      setBookings(data || []);
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
    const clientsMap =
      new Map();

    bookings.forEach(
      (booking) => {
        const key =
          booking.phone ||
          booking.email ||
          String(booking.id);

        if (
          !clientsMap.has(key)
        ) {
          clientsMap.set(key, {
            id: key,

            name:
              booking.client_name,

            phone:
              booking.phone || "",

            email:
              booking.email || "",

            totalBookings: 0,

            acceptedBookings: 0,

            pendingBookings: 0,

            lastBooking:
              booking.booking_date,

            services:
              new Set(),
          });
        }

        const client =
          clientsMap.get(key);

        client.totalBookings +=
          1;

        if (
          booking.status ===
          "accepted"
        ) {
          client.acceptedBookings +=
            1;
        }

        if (
          booking.status ===
          "pending"
        ) {
          client.pendingBookings +=
            1;
        }

        const bookingServices =
          booking.booking_services ||
          [];

        bookingServices.forEach(
          (service) => {
            client.services.add(
              service.service_name
            );
          }
        );

        if (
          booking.booking_date &&
          booking.booking_date >
            client.lastBooking
        ) {
          client.lastBooking =
            booking.booking_date;
        }
      }
    );

    return Array.from(
      clientsMap.values()
    ).map((client) => ({
      ...client,

      services:
        Array.from(
          client.services
        ),
    }));
  }, [bookings]);

  const filteredClients =
    clients.filter(
      (client) => {
        const term = search
          .toLowerCase()
          .trim();

        if (!term) {
          return true;
        }

        return (
          client.name
            ?.toLowerCase()
            .includes(term) ||
          client.phone?.includes(
            term
          ) ||
          client.email
            ?.toLowerCase()
            .includes(term)
        );
      }
    );

  function openEdit(client) {
    setEditingClient(client);

    setEditForm({
      name:
        client.name || "",
      phone:
        client.phone || "",
      email:
        client.email || "",
    });
  }

  function closeEdit() {
    if (
      saving ||
      deleting
    ) {
      return;
    }

    setEditingClient(null);

    setEditForm({
      name: "",
      phone: "",
      email: "",
    });
  }

  function updateEditField(
    field,
    value
  ) {
    setEditForm(
      (currentForm) => ({
        ...currentForm,
        [field]: value,
      })
    );
  }

  async function saveClient() {
    if (
      !editForm.name.trim()
    ) {
      alert(
        "Preenche o nome da cliente."
      );
      return;
    }

    if (
      !editForm.phone.trim()
    ) {
      alert(
        "Preenche o número de telemóvel."
      );
      return;
    }

    try {
      setSaving(true);

      await updateClient({
        originalPhone:
          editingClient.phone,

        originalEmail:
          editingClient.email,

        name:
          editForm.name,

        phone:
          editForm.phone,

        email:
          editForm.email,
      });

      await loadClients();

      setEditingClient(null);

      alert(
        "Dados da cliente atualizados."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível atualizar a cliente."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeClient() {
    const confirmed =
      window.confirm(
        `Eliminar ${editingClient.name}?\n\nIsto vai eliminar também todas as marcações e o histórico desta cliente.\n\nEsta ação não pode ser anulada.`
      );

    if (!confirmed) {
      return;
    }

    const confirmedAgain =
      window.confirm(
        "Tens a certeza de que queres eliminar definitivamente esta cliente e todas as suas marcações?"
      );

    if (
      !confirmedAgain
    ) {
      return;
    }

    try {
      setDeleting(true);

      await deleteClient({
        originalPhone:
          editingClient.phone,

        originalEmail:
          editingClient.email,
      });

      setEditingClient(null);

      await loadClients();

      alert(
        "Cliente eliminada."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível eliminar a cliente."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="w-full min-w-0">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-10 text-center">
          <p className="text-gray-500">
            A carregar clientes...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="w-full min-w-0">
        <div className="bg-red-50 text-red-600 rounded-2xl p-5 sm:p-6">
          <p>
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={
              loadClients
            }
            className="mt-4 font-semibold underline"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-w-0">
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="title text-3xl sm:text-4xl text-[#3D3D3D]">
          Clientes
        </h1>

        <button
          type="button"
          onClick={
            loadClients
          }
          className="flex-shrink-0 bg-white border border-[#ECE6E2] px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-sm hover:border-[#C8A96A] transition"
        >
          Atualizar
        </button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-5 mb-6 sm:mb-8">
        <input
          type="text"
          placeholder="Pesquisar por nome, telemóvel ou email"
          value={search}
          onChange={(
            event
          ) =>
            setSearch(
              event.target
                .value
            )
          }
          className="w-full border border-gray-300 rounded-xl p-3.5 sm:p-4 outline-none focus:border-[#C8A96A]"
        />
      </div>

      <div className="space-y-4 sm:space-y-5">
        {filteredClients.map(
          (client) => (
            <article
              key={
                client.id
              }
              className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#3D3D3D] break-words">
                    {
                      client.name
                    }
                  </h2>

                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="block text-sm sm:text-base text-[#C8A96A] mt-1 hover:underline"
                    >
                      {
                        client.phone
                      }
                    </a>
                  )}

                  {client.email && (
                    <a
                      href={`mailto:${client.email}`}
                      className="block text-sm text-gray-500 mt-1 break-all hover:underline"
                    >
                      {
                        client.email
                      }
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openEdit(
                      client
                    )
                  }
                  className="flex-shrink-0 border border-[#C8A96A] text-[#A88642] px-3.5 py-2 rounded-xl text-sm font-semibold hover:bg-[#FAF8F6] transition"
                >
                  Editar
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-gray-100 mt-5 sm:mt-6 pt-4 sm:pt-5">
                <div>
                  <p className="text-[11px] sm:text-sm text-gray-500">
                    Marcações
                  </p>

                  <p className="text-xl sm:text-3xl font-bold text-[#C8A96A] mt-1">
                    {
                      client.totalBookings
                    }
                  </p>
                </div>

                <div>
                  <p className="text-[11px] sm:text-sm text-gray-500">
                    Confirmadas
                  </p>

                  <p className="text-lg sm:text-xl font-semibold text-green-600 mt-1">
                    {
                      client.acceptedBookings
                    }
                  </p>
                </div>

                <div>
                  <p className="text-[11px] sm:text-sm text-gray-500">
                    Pendentes
                  </p>

                  <p className="text-lg sm:text-xl font-semibold text-yellow-600 mt-1">
                    {
                      client.pendingBookings
                    }
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs sm:text-sm text-gray-500">
                  Última marcação
                </p>

                <p className="text-sm sm:text-base font-medium text-[#3D3D3D] mt-1">
                  {formatDate(
                    client.lastBooking
                  )}
                </p>
              </div>

              <div className="mt-5">
                <p className="text-xs sm:text-sm text-gray-500 mb-3">
                  Serviços já marcados
                </p>

                <div className="flex flex-wrap gap-2">
                  {client.services.map(
                    (
                      service
                    ) => (
                      <span
                        key={
                          service
                        }
                        className="bg-[#FAF8F6] text-[#3D3D3D] px-3 py-2 rounded-full text-xs sm:text-sm"
                      >
                        {
                          service
                        }
                      </span>
                    )
                  )}

                  {client.services
                    .length ===
                    0 && (
                    <span className="text-sm text-gray-500">
                      Sem
                      serviços
                      registados.
                    </span>
                  )}
                </div>
              </div>
            </article>
          )
        )}

        {filteredClients.length ===
          0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-8 sm:p-10 text-center">
            <p className="text-gray-500">
              Não foi
              encontrada
              nenhuma cliente.
            </p>
          </div>
        )}
      </div>

      {/* MODAL EDITAR CLIENTE */}

      {editingClient && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-5">
          <button
            type="button"
            aria-label="Fechar"
            onClick={
              closeEdit
            }
            className="absolute inset-0"
          />

          <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="title text-3xl text-[#3D3D3D]">
                  Editar
                  cliente
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  As
                  alterações
                  serão
                  aplicadas ao
                  histórico da
                  cliente.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeEdit
                }
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#ECE6E2] text-xl text-[#3D3D3D]"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Nome
                </label>

                <input
                  type="text"
                  value={
                    editForm.name
                  }
                  onChange={(
                    event
                  ) =>
                    updateEditField(
                      "name",
                      event
                        .target
                        .value
                    )
                  }
                  className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Telemóvel
                </label>

                <input
                  type="tel"
                  value={
                    editForm.phone
                  }
                  onChange={(
                    event
                  ) =>
                    updateEditField(
                      "phone",
                      event
                        .target
                        .value
                    )
                  }
                  className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={
                    editForm.email
                  }
                  onChange={(
                    event
                  ) =>
                    updateEditField(
                      "email",
                      event
                        .target
                        .value
                    )
                  }
                  className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
                />
              </div>
            </div>

            <div className="mt-7 space-y-3">
              <button
                type="button"
                disabled={
                  saving ||
                  deleting
                }
                onClick={
                  saveClient
                }
                className={`w-full py-3.5 rounded-2xl text-white font-semibold transition ${
                  saving ||
                  deleting
                    ? "bg-gray-300"
                    : "bg-[#C8A96A] hover:opacity-90"
                }`}
              >
                {saving
                  ? "A guardar..."
                  : "Guardar alterações"}
              </button>

              <button
                type="button"
                disabled={
                  saving ||
                  deleting
                }
                onClick={
                  removeClient
                }
                className="w-full py-3 rounded-2xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
              >
                {deleting
                  ? "A eliminar..."
                  : "Eliminar cliente"}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Eliminar
              cliente
              remove também
              todas as suas
              marcações e
              histórico.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default Clients;