import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt";

import "../../styles/fullcalendar.css";

import {
  getAcceptedBookings,
} from "../../services/bookings";

function formatTime(date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function CalendarAdmin() {
  const navigate = useNavigate();

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

      const data = await getAcceptedBookings();

      setBookings(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Não foi possível carregar as marcações da agenda."
      );
    } finally {
      setLoading(false);
    }
  }

  const events = bookings.map((booking) => {
    const start = new Date(
      `${booking.booking_date}T${booking.booking_time}`
    );

    const end = new Date(
      start.getTime() +
        Number(booking.total_duration) * 60000
    );

    const services =
      booking.booking_services || [];

    return {
      id: String(booking.id),
      title: booking.client_name,
      start,
      end,

      extendedProps: {
        phone: booking.phone,
        duration: booking.total_duration,

        services: services.map(
          (service) => service.service_name
        ),
      },
    };
  });

  function renderEventContent(eventInfo) {
  const startTime = eventInfo.event.start
    ? `${String(eventInfo.event.start.getHours()).padStart(2, "0")}:${String(
        eventInfo.event.start.getMinutes()
      ).padStart(2, "0")}`
    : "";

  return (
    <div className="calendar-event-compact">
      <span className="calendar-event-compact-time">
        {startTime}
      </span>

      <span className="calendar-event-compact-name">
        {eventInfo.event.title}
      </span>
    </div>
  );
}

  function addEventTooltip(eventInfo) {
    const event = eventInfo.event;

    const startTime = formatTime(event.start);
    const endTime = formatTime(event.end);

    const tooltip = `${startTime} - ${endTime}\n${event.title}`;

    eventInfo.el.setAttribute(
      "title",
      tooltip
    );

    eventInfo.el.setAttribute(
      "aria-label",
      `${startTime} até ${endTime}. ${event.title}`
    );
  }

  if (loading) {
    return (
      <main>
        <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
          <p className="text-gray-500">
            A carregar agenda...
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
            onClick={loadBookings}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="title text-4xl text-[#3D3D3D]">
            Agenda
          </h1>

          <p className="text-gray-500 mt-2">
            Passe o rato sobre uma marcação para ver a hora e o nome da cliente.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBookings}
          className="bg-white border border-[#ECE6E2] px-5 py-3 rounded-2xl hover:border-[#C8A96A] transition"
        >
          Atualizar agenda
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}
          locale={ptLocale}
          initialView="timeGridWeek"
          firstDay={1}
          height="80vh"
          expandRows
          nowIndicator
          allDaySlot={false}
          slotDuration="00:30:00"
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"

          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right:
              "dayGridMonth,timeGridWeek,timeGridDay",
          }}

          buttonText={{
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
          }}


          events={events}

          eventContent={renderEventContent}
          eventDidMount={addEventTooltip}

          eventDisplay="block"
          dayMaxEvents={true}

          eventClick={(information) =>
            navigate(
              `/admin/pedido/${information.event.id}`
            )
          }
        />
      </div>
    </main>
  );
}

export default CalendarAdmin;