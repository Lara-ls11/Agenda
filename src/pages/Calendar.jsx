import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import logo from "../assets/logo.png";
import { getAvailableTimes } from "../services/availability";

function CalendarPage() {
  const navigate = useNavigate();

  const services =
    JSON.parse(localStorage.getItem("services")) || [];

  const [date, setDate] = useState(new Date());

  const [times, setTimes] = useState([]);

  const [selectedTime, setSelectedTime] =
    useState("");

  const [loading, setLoading] = useState(false);

  function toISO(date) {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    loadTimes();
  }, [date]);

  async function loadTimes() {
    try {
      setLoading(true);

      setSelectedTime("");

      const available =
        await getAvailableTimes(
          toISO(date),
          services
        );

      setTimes(available);
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível carregar os horários."
      );
    } finally {
      setLoading(false);
    }
  }

  function continueBooking() {
    localStorage.setItem(
      "bookingDraft",
      JSON.stringify({
        services,
        date: toISO(date),
        time: selectedTime,
      })
    );

    navigate("/cliente");
  }

  return (
    <main className="min-h-screen bg-[#FAF8F6] px-6 py-10">

      <div className="max-w-xl mx-auto">

        <img
          src={logo}
          alt="Mónica Lima"
          className="w-24 mx-auto mb-6"
        />

        <h1 className="title text-4xl text-center text-[#3D3D3D] mb-3">
          Escolha uma data
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Apenas são apresentados horários
          disponíveis.
        </p>

        <div className="flex justify-center mb-10">

          <Calendar
            value={date}
            onChange={(newDate) => {
              setDate(newDate);
            }}
            locale="pt-PT"
            minDate={new Date()}
          />

        </div>

        <h2 className="text-xl font-semibold mb-5">
          Horários disponíveis
        </h2>

        {loading && (
          <p className="text-gray-500">
            A carregar horários...
          </p>
        )}

        {!loading && times.length === 0 && (

          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">

            <p className="text-gray-500">
              Não existem horários disponíveis
              neste dia.
            </p>

          </div>

        )}

        <div className="grid grid-cols-3 gap-3">

          {times.map((time) => (

            <button
              key={time}
              onClick={() =>
                setSelectedTime(time)
              }
              className={`rounded-xl py-3 transition border
              ${
                selectedTime === time
                  ? "bg-[#C8A96A] text-white border-[#C8A96A]"
                  : "bg-white hover:border-[#C8A96A]"
              }`}
            >
              {time}
            </button>

          ))}

        </div>

        <button
          disabled={!selectedTime}
          onClick={continueBooking}
          className={`w-full mt-10 py-4 rounded-2xl font-semibold transition
          ${
            !selectedTime
              ? "bg-gray-300 text-gray-500"
              : "bg-[#C8A96A] text-white hover:opacity-90"
          }`}
        >
          Continuar
        </button>

      </div>

    </main>
  );
}

export default CalendarPage;