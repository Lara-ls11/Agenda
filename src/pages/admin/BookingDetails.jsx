import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  deleteBooking,
  getBooking,
  getBookingConflicts,
  updateBooking,
  updateBookingStatus,
} from "../../services/bookings";

import { getServices } from "../../services/services";

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Pendente",
  },
  {
    value: "accepted",
    label: "Aceite",
  },
  {
    value: "completed",
    label: "Concluída",
  },
  {
    value: "cancelled",
    label: "Cancelada",
  },
  {
    value: "rejected",
    label: "Recusada",
  },
];

function getStatusDetails(status) {
  switch (status) {
    case "accepted":
      return {
        label: "Aceite",
        className: "bg-green-100 text-green-700",
      };

    case "completed":
      return {
        label: "Concluída",
        className: "bg-blue-100 text-blue-700",
      };

    case "cancelled":
      return {
        label: "Cancelada",
        className: "bg-gray-200 text-gray-700",
      };

    case "rejected":
      return {
        label: "Recusada",
        className: "bg-red-100 text-red-700",
      };

    default:
      return {
        label: "Pendente",
        className: "bg-yellow-100 text-yellow-700",
      };
  }
}

function minutesToTime(minutes) {
  const normalizedMinutes =
    ((minutes % 1440) + 1440) % 1440;

  const hours = Math.floor(normalizedMinutes / 60);
  const remainingMinutes = normalizedMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    remainingMinutes
  ).padStart(2, "0")}`;
}

function calculateEndTime(time, duration) {
  if (!time) {
    return "";
  }

  const [hours, minutes] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  return minutesToTime(
    hours * 60 + minutes + Number(duration)
  );
}

function formatDatePt(dateString) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-PT").format(
    new Date(`${dateString}T12:00:00`)
  );
}

function normalizePhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("351")) {
    return digits;
  }

  if (digits.length === 9) {
    return `351${digits}`;
  }

  return digits;
}

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);

  const [availableServices, setAvailableServices] =
    useState([]);

  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    email: "",
    notes: "",
    bookingDate: "",
    bookingTime: "",
    status: "pending",
    selectedServiceIds: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [conflicts, setConflicts] = useState([]);
  const [pendingSave, setPendingSave] =
    useState(false);

  useEffect(() => {
    loadPage();
  }, [id]);

  async function loadPage() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [bookingData, servicesData] =
        await Promise.all([
          getBooking(id),
          getServices(),
        ]);

      setBooking(bookingData);
      setAvailableServices(servicesData);

      const currentServiceIds = (
        bookingData.booking_services || []
      )
        .map((service) =>
          Number(service.service_id)
        )
        .filter(Number.isFinite);

      setForm({
        clientName: bookingData.client_name || "",
        phone: bookingData.phone || "",
        email: bookingData.email || "",
        notes: bookingData.notes || "",
        bookingDate:
          bookingData.booking_date || "",
        bookingTime:
          bookingData.booking_time?.slice(0, 5) ||
          "",
        status: bookingData.status || "pending",
        selectedServiceIds: currentServiceIds,
      });
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Não foi possível carregar esta marcação."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setConflicts([]);
    setPendingSave(false);
  }

  function toggleService(serviceId) {
    setForm((currentForm) => {
      const exists =
        currentForm.selectedServiceIds.includes(
          serviceId
        );

      return {
        ...currentForm,
        selectedServiceIds: exists
          ? currentForm.selectedServiceIds.filter(
              (currentId) =>
                currentId !== serviceId
            )
          : [
              ...currentForm.selectedServiceIds,
              serviceId,
            ],
      };
    });

    setConflicts([]);
    setPendingSave(false);
  }

  const selectedServices = useMemo(() => {
    return availableServices.filter((service) =>
      form.selectedServiceIds.includes(
        Number(service.id)
      )
    );
  }, [
    availableServices,
    form.selectedServiceIds,
  ]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce(
      (total, service) =>
        total + Number(service.duration),
      0
    );
  }, [selectedServices]);

  const endTime = calculateEndTime(
    form.bookingTime,
    totalDuration
  );

  function openWhatsApp(message = "") {
    const phone = normalizePhone(form.phone);

    if (!phone || phone.length < 12) {
      alert(
        "O número de telemóvel da cliente não é válido."
      );
      return;
    }

    const encodedMessage =
      message.trim() !== ""
        ? `?text=${encodeURIComponent(message)}`
        : "";

    const url = `https://wa.me/${phone}${encodedMessage}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function sendConfirmationMessage() {
    const message = `Olá ${form.clientName},

A sua marcação foi confirmada.

Data: ${formatDatePt(form.bookingDate)}
Hora: ${form.bookingTime}

Até breve,
Mónica Lima`;

    openWhatsApp(message);
  }

  function sendChangeMessage() {
    const message = `Olá ${form.clientName},

A sua marcação foi alterada.

Nova data: ${formatDatePt(form.bookingDate)}
Nova hora: ${form.bookingTime}

Até breve,
Mónica Lima`;

    openWhatsApp(message);
  }

  function sendReminderMessage() {
    const message = `Olá ${form.clientName},

Recordamos que tem uma marcação agendada.

Data: ${formatDatePt(form.bookingDate)}
Hora: ${form.bookingTime}

Até breve,
Mónica Lima`;

    openWhatsApp(message);
  }

  function sendCancellationMessage() {
    const message = `Olá ${form.clientName},

A sua marcação de ${formatDatePt(
      form.bookingDate
    )}, às ${form.bookingTime}, foi cancelada.

Entre em contacto para reagendarmos.

Mónica Lima`;

    openWhatsApp(message);
  }

  async function saveChanges(forceSave = false) {
    if (!form.clientName.trim()) {
      alert("Preenche o nome da cliente.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Preenche o telemóvel.");
      return;
    }

    if (
      !form.bookingDate ||
      !form.bookingTime
    ) {
      alert("Escolhe a data e a hora.");
      return;
    }

    if (selectedServices.length === 0) {
      alert(
        "Escolhe pelo menos um serviço."
      );
      return;
    }

    try {
      setSaving(true);

      if (
        form.status === "accepted" &&
        !forceSave
      ) {
        const foundConflicts =
          await getBookingConflicts({
            bookingId: booking.id,
            bookingDate: form.bookingDate,
            bookingTime: form.bookingTime,
            totalDuration,
          });

        if (foundConflicts.length > 0) {
          setConflicts(foundConflicts);
          setPendingSave(true);
          setSaving(false);
          return;
        }
      }

      const updatedBooking =
        await updateBooking(
          booking.id,
          {
            client_name:
              form.clientName.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            notes: form.notes.trim(),
            booking_date:
              form.bookingDate,
            booking_time:
              form.bookingTime,
            total_duration:
              totalDuration,
            status: form.status,
          },
          selectedServices
        );

      setBooking(updatedBooking);
      setConflicts([]);
      setPendingSave(false);

      alert(
        "Marcação atualizada com sucesso."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível guardar as alterações."
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(status) {
    try {
      setSaving(true);

      await updateBookingStatus(
        booking.id,
        status
      );

      setBooking((currentBooking) => ({
        ...currentBooking,
        status,
      }));

      setForm((currentForm) => ({
        ...currentForm,
        status,
      }));

      alert(
        status === "accepted"
          ? "Marcação aceite."
          : "Estado atualizado."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível alterar o estado."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Tem a certeza de que pretende eliminar esta marcação? Esta ação não pode ser anulada."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await deleteBooking(booking.id);

      alert("Marcação eliminada.");

      navigate("/admin/agenda", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível eliminar a marcação."
      );
    } finally {
      setDeleting(false);
    }
  }

  function openConflictBooking(conflictId) {
    window.open(
      `/admin/pedido/${conflictId}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (loading) {
    return (
      <main>
        <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
          <p className="text-gray-500">
            A carregar marcação...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !booking) {
    return (
      <main>
        <div className="bg-red-50 text-red-600 rounded-2xl p-6">
          <p>
            {errorMessage ||
              "Marcação não encontrada."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/agenda")
            }
            className="mt-4 font-semibold underline"
          >
            Voltar à agenda
          </button>
        </div>
      </main>
    );
  }

  const statusDetails =
    getStatusDetails(form.status);

  const servicesByCategory =
    availableServices.reduce(
      (groups, service) => {
        if (!groups[service.category]) {
          groups[service.category] = [];
        }

        groups[service.category].push(
          service
        );

        return groups;
      },
      {}
    );

  return (
    <main>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[#C8A96A] mb-4 hover:underline"
          >
            ← Voltar
          </button>

          <h1 className="title text-4xl text-[#3D3D3D]">
            Editar Marcação
          </h1>

          <p className="text-gray-500 mt-2">
            Pedido #{booking.id}
          </p>
        </div>

        <span
          className={`self-start px-4 py-2 rounded-full text-sm font-semibold ${statusDetails.className}`}
        >
          {statusDetails.label}
        </span>
      </div>

      <section className="bg-white rounded-3xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-semibold text-[#3D3D3D] mb-6">
          Dados da cliente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Nome
            </label>

            <input
              type="text"
              value={form.clientName}
              onChange={(event) =>
                updateField(
                  "clientName",
                  event.target.value
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
              value={form.phone}
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value
                )
              }
              className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-2">
              Email
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value
                )
              }
              className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-semibold text-[#3D3D3D] mb-6">
          Data e hora
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Data
            </label>

            <input
              type="date"
              value={form.bookingDate}
              onChange={(event) =>
                updateField(
                  "bookingDate",
                  event.target.value
                )
              }
              className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Hora de início
            </label>

            <input
              type="time"
              value={form.bookingTime}
              onChange={(event) =>
                updateField(
                  "bookingTime",
                  event.target.value
                )
              }
              className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Hora prevista de fim
            </label>

            <div className="w-full bg-[#FAF8F6] rounded-xl p-4 font-semibold text-[#3D3D3D]">
              {endTime || "—"}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          A duração total é de{" "}
          <strong>
            {totalDuration} minutos
          </strong>
          .
        </p>
      </section>

      <section className="bg-white rounded-3xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-semibold text-[#3D3D3D] mb-6">
          Serviços
        </h2>

        <div className="space-y-8">
          {Object.entries(
            servicesByCategory
          ).map(
            ([
              category,
              categoryServices,
            ]) => (
              <div key={category}>
                <h3 className="font-semibold text-[#C8A96A] mb-3">
                  {category}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryServices.map(
                    (service) => {
                      const selected =
                        form.selectedServiceIds.includes(
                          Number(service.id)
                        );

                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() =>
                            toggleService(
                              Number(service.id)
                            )
                          }
                          className={`text-left border rounded-2xl p-4 transition ${
                            selected
                              ? "bg-[#C8A96A] border-[#C8A96A] text-white"
                              : "bg-white border-[#ECE6E2] hover:border-[#C8A96A]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-medium">
                                {service.name}
                              </p>

                              <p
                                className={`text-sm mt-1 ${
                                  selected
                                    ? "text-white/80"
                                    : "text-gray-500"
                                }`}
                              >
                                {
                                  service.duration
                                }{" "}
                                minutos
                              </p>
                            </div>

                            <span className="text-xl">
                              {selected
                                ? "✓"
                                : "○"}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <section className="bg-white rounded-3xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-semibold text-[#3D3D3D] mb-6">
          Estado e observações
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Estado
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value
                )
              }
              className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
            >
              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Observações
            </label>

            <textarea
              rows="5"
              value={form.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value
                )
              }
              className="w-full border border-gray-300 rounded-xl p-4 outline-none resize-none focus:border-[#C8A96A]"
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl shadow-sm p-6 mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#3D3D3D]">
              Contactar cliente
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Abra o WhatsApp com uma mensagem preparada.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openWhatsApp("")}
            className="self-start border border-[#C8A96A] text-[#A88642] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#FAF8F6] transition"
          >
            Abrir conversa
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={sendConfirmationMessage}
            className="bg-[#FAF8F6] border border-[#ECE6E2] text-[#3D3D3D] px-4 py-3 rounded-xl text-sm font-medium hover:border-[#C8A96A] hover:bg-[#F5F0EA] transition"
          >
            Confirmação
          </button>

          <button
            type="button"
            onClick={sendChangeMessage}
            className="bg-[#FAF8F6] border border-[#ECE6E2] text-[#3D3D3D] px-4 py-3 rounded-xl text-sm font-medium hover:border-[#C8A96A] hover:bg-[#F5F0EA] transition"
          >
            Alteração
          </button>

          <button
            type="button"
            onClick={sendReminderMessage}
            className="bg-[#FAF8F6] border border-[#ECE6E2] text-[#3D3D3D] px-4 py-3 rounded-xl text-sm font-medium hover:border-[#C8A96A] hover:bg-[#F5F0EA] transition"
          >
            Lembrete
          </button>

          <button
            type="button"
            onClick={sendCancellationMessage}
            className="bg-[#FAF8F6] border border-[#ECE6E2] text-[#3D3D3D] px-4 py-3 rounded-xl text-sm font-medium hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition"
          >
            Cancelamento
          </button>
        </div>
      </section>

      {conflicts.length > 0 && (
        <section className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-800">
            Atenção: existe sobreposição
          </h2>

          <p className="text-yellow-700 mt-2">
            Podes guardar esta marcação na mesma ou abrir as outras marcações para as alterar.
          </p>

          <div className="space-y-3 mt-5">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="bg-white rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-[#3D3D3D]">
                    {conflict.client_name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {conflict.booking_time?.slice(
                      0,
                      5
                    )}{" "}
                    às{" "}
                    {calculateEndTime(
                      conflict.booking_time?.slice(
                        0,
                        5
                      ),
                      conflict.total_duration
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openConflictBooking(
                      conflict.id
                    )
                  }
                  className="text-[#C8A96A] font-semibold hover:underline"
                >
                  Abrir marcação
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveChanges(true)
              }
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Guardar na mesma
            </button>

            <button
              type="button"
              onClick={() => {
                setConflicts([]);
                setPendingSave(false);
              }}
              className="bg-white border border-yellow-300 text-yellow-700 px-6 py-3 rounded-xl"
            >
              Voltar a editar
            </button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          disabled={
            saving ||
            deleting ||
            pendingSave
          }
          onClick={() =>
            saveChanges(false)
          }
          className={`py-4 rounded-2xl text-white font-semibold transition ${
            saving ||
            deleting ||
            pendingSave
              ? "bg-gray-300"
              : "bg-[#C8A96A] hover:opacity-90"
          }`}
        >
          {saving
            ? "A guardar..."
            : "Guardar Alterações"}
        </button>

        <button
          type="button"
          disabled={saving || deleting}
          onClick={handleDelete}
          className={`py-4 rounded-2xl font-semibold transition ${
            saving || deleting
              ? "bg-gray-200 text-gray-500"
              : "bg-white border border-red-200 text-red-600 hover:bg-red-50"
          }`}
        >
          {deleting
            ? "A eliminar..."
            : "Eliminar Marcação"}
        </button>
      </div>

      {booking.status === "pending" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <button
            type="button"
            disabled={saving || deleting}
            onClick={() =>
              changeStatus("accepted")
            }
            className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition"
          >
            Aceitar rapidamente
          </button>

          <button
            type="button"
            disabled={saving || deleting}
            onClick={() =>
              changeStatus("rejected")
            }
            className="bg-red-100 hover:bg-red-200 text-red-700 py-4 rounded-2xl font-semibold transition"
          >
            Recusar rapidamente
          </button>
        </div>
      )}
    </main>
  );
}

export default BookingDetails;