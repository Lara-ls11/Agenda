import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";
import { createBooking } from "../services/bookings";

function Customer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function submitBooking(event) {
    event.preventDefault();

    const bookingDraft = JSON.parse(
      localStorage.getItem("bookingDraft")
    );

    if (
      !bookingDraft ||
      !bookingDraft.services?.length ||
      !bookingDraft.date ||
      !bookingDraft.time
    ) {
      alert(
        "Faltam dados da marcação. Escolhe novamente os serviços, a data e a hora."
      );

      navigate("/servicos");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const bookingId = await createBooking(
        {
          client_name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          notes: form.notes.trim(),
          booking_date: bookingDraft.date,
          booking_time: bookingDraft.time,
        },
        bookingDraft.services
      );

      localStorage.setItem(
        "lastBooking",
        JSON.stringify({
          id: bookingId,
          services: bookingDraft.services,
          date: bookingDraft.date,
          time: bookingDraft.time,
          customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            notes: form.notes.trim(),
          },
        })
      );

      localStorage.removeItem("services");
      localStorage.removeItem("bookingDraft");

      navigate("/sucesso", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Não foi possível enviar o pedido. Tenta novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  const formIsValid =
    form.name.trim() !== "" &&
    form.phone.trim() !== "";

  return (
    <main className="min-h-screen bg-[#FAF8F6] px-6 py-10">
      <div className="max-w-xl mx-auto">
        <img
          src={logo}
          alt="Mónica Lima"
          className="w-24 mx-auto mb-6"
        />

        <h1 className="title text-4xl text-center text-[#3D3D3D] mb-3">
          Os seus dados
        </h1>

        <p className="text-center text-gray-500 mb-10">
          Preencha os seus dados para enviar o pedido.
        </p>

        <form
          onSubmit={submitBooking}
          className="bg-white rounded-3xl shadow-sm p-6 space-y-5"
        >
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Nome completo
            </label>

            <input
              type="text"
              required
              value={form.name}
              onChange={(event) =>
                updateField("name", event.target.value)
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
              required
              value={form.phone}
              onChange={(event) =>
                updateField("phone", event.target.value)
              }
              className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Email
              <span className="text-gray-400">
                {" "}
                (opcional)
              </span>
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField("email", event.target.value)
              }
              className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-[#C8A96A]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Observações
              <span className="text-gray-400">
                {" "}
                (opcional)
              </span>
            </label>

            <textarea
              rows="4"
              value={form.notes}
              onChange={(event) =>
                updateField("notes", event.target.value)
              }
              className="w-full border border-gray-300 rounded-xl p-4 outline-none resize-none focus:border-[#C8A96A]"
            />
          </div>

          {errorMessage && (
            <p className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={!formIsValid || loading}
            className={`w-full py-4 rounded-2xl font-semibold transition ${
              !formIsValid || loading
                ? "bg-gray-300 text-gray-500"
                : "bg-[#C8A96A] text-white hover:opacity-90"
            }`}
          >
            {loading
              ? "A enviar pedido..."
              : "Enviar Pedido"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Customer;