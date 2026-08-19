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
  const [errorMessage, setErrorMessage] =
    useState("");

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768
  );

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data =
        await getAcceptedBookings();

      setBookings(data || []);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Não foi possível carregar as marcações da agenda."
      );
    } finally {
      setLoading(false);
    }
  }

  const events = bookings.map(
    (booking) => {
      const start = new Date(
        `${booking.booking_date}T${booking.booking_time}`
      );

      const end = new Date(
        start.getTime() +
          Number(
            booking.total_duration
          ) *
            60000
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
          duration:
            booking.total_duration,

          services: services.map(
            (service) =>
              service.service_name
          ),
        },
      };
    }
  );

  function renderEventContent(
    eventInfo
  ) {
    const startTime =
      eventInfo.event.start
        ? `${String(
            eventInfo.event.start.getHours()
          ).padStart(2, "0")}:${String(
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

  function addEventTooltip(
    eventInfo
  ) {
    const event = eventInfo.event;

    const startTime = formatTime(
      event.start
    );

    const endTime = formatTime(
      event.end
    );

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
      <main className="w-full min-w-0">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-8 sm:p-10 text-center">
          <p className="text-gray-500">
            A carregar agenda...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="w-full min-w-0">
        <div className="bg-red-50 text-red-600 rounded-2xl p-5 sm:p-6">
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
    <main className="w-full min-w-0">
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="title text-3xl sm:text-4xl text-[#3D3D3D]">
          Agenda
        </h1>

        <button
          type="button"
          onClick={loadBookings}
          className="flex-shrink-0 bg-white border border-[#ECE6E2] px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-sm hover:border-[#C8A96A] transition"
        >
          Atualizar
        </button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm sm:shadow-lg p-3 sm:p-6 overflow-hidden">
        <div className="admin-calendar-wrapper">
          <FullCalendar
            key={
              isMobile
                ? "mobile-calendar"
                : "desktop-calendar"
            }
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
            ]}
            locale={ptLocale}
            initialView={
              isMobile
                ? "timeGridDay"
                : "timeGridWeek"
            }
            firstDay={1}
            height={
              isMobile
                ? "70vh"
                : "80vh"
            }
            expandRows
            nowIndicator
            allDaySlot={false}
            slotDuration="00:30:00"
            slotMinTime="08:00:00"
            slotMaxTime="22:00:00"
            slotLabelInterval="01:00"
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
            eventContent={
              renderEventContent
            }
            eventDidMount={
              addEventTooltip
            }
            eventDisplay="block"
            dayMaxEvents={true}
            eventClick={(
              information
            ) =>
              navigate(
                `/admin/pedido/${information.event.id}`
              )
            }
          />
        </div>
      </div>
    </main>
  );
}

export default CalendarAdmin;