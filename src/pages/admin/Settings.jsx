import { useEffect, useState } from "react";

import {
  getWorkingHours,
  saveWorkingHours,
  getBusinessSettings,
  saveBusinessSettings,
  getBlockedDates,
  createBlockedPeriod,
  deleteBlockedPeriod,
} from "../../services/settings";

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-PT").format(
    new Date(`${dateString}T12:00:00`)
  );
}

function Settings() {
  const [schedule, setSchedule] = useState([]);

  const [hasLunchBreak, setHasLunchBreak] =
    useState(false);

  const [lunchStart, setLunchStart] =
    useState("13:00");

  const [lunchEnd, setLunchEnd] =
    useState("14:00");

  /* Dias em que existe pausa
     0 = Domingo
     1 = Segunda
     2 = Terça
     3 = Quarta
     4 = Quinta
     5 = Sexta
     6 = Sábado
  */
  const [breakWeekdays, setBreakWeekdays] =
    useState([1, 2, 3, 4, 5]);

  const [blockedDates, setBlockedDates] =
    useState([]);

  const [
    blockedStartDate,
    setBlockedStartDate,
  ] = useState("");

  const [
    blockedEndDate,
    setBlockedEndDate,
  ] = useState("");

  const [
    blockedReason,
    setBlockedReason,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [blocking, setBlocking] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        workingHoursData,
        businessSettingsData,
        blockedDatesData,
      ] = await Promise.all([
        getWorkingHours(),
        getBusinessSettings(),
        getBlockedDates(),
      ]);

      const orderedSchedule =
        workingHoursData.sort(
          (firstDay, secondDay) => {
            const order = [
              1, 2, 3, 4, 5, 6, 0,
            ];

            return (
              order.indexOf(
                firstDay.weekday
              ) -
              order.indexOf(
                secondDay.weekday
              )
            );
          }
        );

      setSchedule(orderedSchedule);

      setHasLunchBreak(
        businessSettingsData.hasLunchBreak
      );

      setLunchStart(
        businessSettingsData.lunchStart
      );

      setLunchEnd(
        businessSettingsData.lunchEnd
      );

      setBreakWeekdays(
        businessSettingsData.breakWeekdays ||
          []
      );

      setBlockedDates(
        blockedDatesData
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Não foi possível carregar as definições."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateSchedule(
    id,
    field,
    value
  ) {
    setSchedule(
      (currentSchedule) =>
        currentSchedule.map(
          (day) =>
            day.id === id
              ? {
                  ...day,
                  [field]: value,
                }
              : day
        )
    );
  }

  function toggleBreakWeekday(
    weekday
  ) {
    setBreakWeekdays(
      (currentDays) => {
        if (
          currentDays.includes(
            weekday
          )
        ) {
          return currentDays.filter(
            (day) =>
              day !== weekday
          );
        }

        return [
          ...currentDays,
          weekday,
        ];
      }
    );
  }

  async function addBlockedPeriod() {
    if (!blockedStartDate) {
      alert(
        "Escolhe pelo menos a data inicial."
      );

      return;
    }

    const finalDate =
      blockedEndDate ||
      blockedStartDate;

    if (
      finalDate <
      blockedStartDate
    ) {
      alert(
        "A data final não pode ser anterior à data inicial."
      );

      return;
    }

    try {
      setBlocking(true);

      const newBlockedPeriod =
        await createBlockedPeriod({
          startDate:
            blockedStartDate,

          endDate:
            finalDate,

          reason:
            blockedReason,
        });

      setBlockedDates(
        (currentDates) =>
          [
            ...currentDates,
            newBlockedPeriod,
          ].sort(
            (
              firstPeriod,
              secondPeriod
            ) =>
              firstPeriod.start_date.localeCompare(
                secondPeriod.start_date
              )
          )
      );

      setBlockedStartDate("");
      setBlockedEndDate("");
      setBlockedReason("");
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível bloquear este período."
      );
    } finally {
      setBlocking(false);
    }
  }

  async function removeBlockedPeriod(
    id
  ) {
    const confirmed =
      window.confirm(
        "Tem a certeza de que pretende remover este período bloqueado?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBlockedPeriod(
        id
      );

      setBlockedDates(
        (currentDates) =>
          currentDates.filter(
            (blockedDate) =>
              blockedDate.id !== id
          )
      );
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível remover este período."
      );
    }
  }

  async function saveSettings() {
    const invalidDay =
      schedule.find(
        (day) =>
          day.open &&
          (!day.start ||
            !day.end ||
            day.start >= day.end)
      );

    if (invalidDay) {
      alert(
        `Confirma o horário de ${invalidDay.day}.`
      );

      return;
    }

    if (
      hasLunchBreak &&
      (!lunchStart ||
        !lunchEnd ||
        lunchStart >= lunchEnd)
    ) {
      alert(
        "Confirma as horas da pausa para almoço."
      );

      return;
    }

    if (
      hasLunchBreak &&
      breakWeekdays.length === 0
    ) {
      alert(
        "Seleciona pelo menos um dia para a pausa."
      );

      return;
    }

    try {
      setSaving(true);

      await Promise.all([
        saveWorkingHours(
          schedule
        ),

        saveBusinessSettings({
          hasLunchBreak,
          lunchStart,
          lunchEnd,
          breakWeekdays,
        }),
      ]);

      alert(
        "Definições guardadas com sucesso."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível guardar as definições."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main>
        <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
          <p className="text-gray-500">
            A carregar definições...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main>
        <div className="bg-red-50 text-red-600 rounded-2xl p-6">
          <p>
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={
              loadSettings
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
    <main>
      {/* Cabeçalho */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="title text-4xl text-[#3D3D3D]">
            Definições
          </h1>
        </div>

        <button
          type="button"
          onClick={
            loadSettings
          }
          className="bg-white border border-[#ECE6E2] px-5 py-3 rounded-2xl hover:border-[#C8A96A] transition"
        >
          Atualizar
        </button>
      </div>

      {/* ===========================
          HORÁRIO DE TRABALHO
      =========================== */}

      <section className="bg-white rounded-3xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-semibold text-[#3D3D3D] mb-6">
          Horário de trabalho
        </h2>

        <div className="space-y-4">
          {schedule.map(
            (day) => (
              <div
                key={
                  day.id
                }
                className="border border-gray-100 rounded-2xl p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        day.open
                      }
                      onChange={(
                        event
                      ) =>
                        updateSchedule(
                          day.id,
                          "open",
                          event.target
                            .checked
                        )
                      }
                      className="w-5 h-5 accent-[#C8A96A]"
                    />

                    <span className="font-semibold text-[#3D3D3D]">
                      {
                        day.day
                      }
                    </span>
                  </div>

                  {day.open ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                      <input
                        type="time"
                        value={
                          day.start
                        }
                        onChange={(
                          event
                        ) =>
                          updateSchedule(
                            day.id,
                            "start",
                            event
                              .target
                              .value
                          )
                        }
                        className="border border-gray-300 rounded-xl p-3 outline-none focus:border-[#C8A96A]"
                      />

                      <span className="text-gray-500">
                        às
                      </span>

                      <input
                        type="time"
                        value={
                          day.end
                        }
                        onChange={(
                          event
                        ) =>
                          updateSchedule(
                            day.id,
                            "end",
                            event
                              .target
                              .value
                          )
                        }
                        className="border border-gray-300 rounded-xl p-3 outline-none focus:border-[#C8A96A]"
                      />
                    </div>
                  ) : (
                    <span className="text-red-500 font-medium">
                      Encerrado
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* ===========================
          PAUSA PARA ALMOÇO
      =========================== */}

      <section className="bg-white rounded-3xl shadow-sm p-6 mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-2xl font-semibold text-[#3D3D3D]">
              Pausa para almoço
            </h2>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={
              hasLunchBreak
            }
            onClick={() =>
              setHasLunchBreak(
                (currentValue) =>
                  !currentValue
              )
            }
            className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full transition ${
              hasLunchBreak
                ? "bg-[#C8A96A]"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                hasLunchBreak
                  ? "translate-x-7"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {hasLunchBreak ? (
          <div className="mt-6">

            {/* Horário */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

              <div className="flex-1 sm:flex-none">
                <label className="block text-sm text-gray-500 mb-2">
                  Início
                </label>

                <input
                  type="time"
                  value={
                    lunchStart
                  }
                  onChange={(
                    event
                  ) =>
                    setLunchStart(
                      event.target
                        .value
                    )
                  }
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#C8A96A]"
                />
              </div>

              <span className="hidden sm:block text-gray-500 mt-7">
                às
              </span>

              <div className="flex-1 sm:flex-none">
                <label className="block text-sm text-gray-500 mb-2">
                  Fim
                </label>

                <input
                  type="time"
                  value={
                    lunchEnd
                  }
                  onChange={(
                    event
                  ) =>
                    setLunchEnd(
                      event.target
                        .value
                    )
                  }
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#C8A96A]"
                />
              </div>
            </div>

            {/* Dias */}

            <div className="mt-7">
              <p className="font-semibold text-[#3D3D3D] mb-2">
                Dias com pausa
              </p>

              <p className="text-sm text-gray-500 mb-4">
                Seleciona os dias em que este horário de pausa se aplica.
              </p>

              <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                {[
                  {
                    weekday: 1,
                    label:
                      "Seg",
                  },
                  {
                    weekday: 2,
                    label:
                      "Ter",
                  },
                  {
                    weekday: 3,
                    label:
                      "Qua",
                  },
                  {
                    weekday: 4,
                    label:
                      "Qui",
                  },
                  {
                    weekday: 5,
                    label:
                      "Sex",
                  },
                  {
                    weekday: 6,
                    label:
                      "Sáb",
                  },
                  {
                    weekday: 0,
                    label:
                      "Dom",
                  },
                ].map(
                  (day) => {
                    const selected =
                      breakWeekdays.includes(
                        day.weekday
                      );

                    return (
                      <button
                        key={
                          day.weekday
                        }
                        type="button"
                        onClick={() =>
                          toggleBreakWeekday(
                            day.weekday
                          )
                        }
                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                          selected
                            ? "border-[#C8A96A] bg-[#C8A96A] text-white"
                            : "border-gray-300 bg-white text-[#3D3D3D] hover:border-[#C8A96A]"
                        }`}
                      >
                        {
                          day.label
                        }
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mt-6">
            Não existe pausa para almoço.
          </p>
        )}
      </section>

      {/* ===========================
          BLOQUEAR DIAS
      =========================== */}

      <section className="bg-white rounded-3xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-semibold text-[#3D3D3D] mb-2">
          Bloquear dias
        </h2>

        <p className="text-gray-500 mb-6">
          Para bloquear apenas um dia, deixa a data final vazia.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Data inicial
            </label>

            <input
              type="date"
              value={
                blockedStartDate
              }
              onChange={(
                event
              ) =>
                setBlockedStartDate(
                  event.target
                    .value
                )
              }
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#C8A96A]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Data final
            </label>

            <input
              type="date"
              min={
                blockedStartDate ||
                undefined
              }
              value={
                blockedEndDate
              }
              onChange={(
                event
              ) =>
                setBlockedEndDate(
                  event.target
                    .value
                )
              }
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#C8A96A]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Motivo
            </label>

            <input
              type="text"
              placeholder="Ex.: férias"
              value={
                blockedReason
              }
              onChange={(
                event
              ) =>
                setBlockedReason(
                  event.target
                    .value
                )
              }
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#C8A96A]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              disabled={
                blocking
              }
              onClick={
                addBlockedPeriod
              }
              className={`w-full text-white rounded-xl px-6 py-3 transition ${
                blocking
                  ? "bg-gray-300"
                  : "bg-[#C8A96A] hover:opacity-90"
              }`}
            >
              {blocking
                ? "A bloquear..."
                : "Bloquear período"}
            </button>
          </div>
        </div>

        <div className="space-y-3 mt-8">
          {blockedDates.map(
            (period) => {
              const isSingleDay =
                period.start_date ===
                period.end_date;

              return (
                <div
                  key={
                    period.id
                  }
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[#FAF8F6] rounded-2xl p-4"
                >
                  <div>
                    <p className="font-semibold text-[#3D3D3D]">
                      {isSingleDay
                        ? formatDate(
                            period.start_date
                          )
                        : `${formatDate(
                            period.start_date
                          )} a ${formatDate(
                            period.end_date
                          )}`}
                    </p>

                    <p className="text-gray-500">
                      {period.reason ||
                        "Indisponível"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeBlockedPeriod(
                        period.id
                      )
                    }
                    className="self-start sm:self-auto text-red-500 hover:text-red-700"
                  >
                    {isSingleDay
                      ? "Remover"
                      : "Remover período"}
                  </button>
                </div>
              );
            }
          )}

          {blockedDates.length ===
            0 && (
            <p className="text-gray-500">
              Ainda não existem dias bloqueados.
            </p>
          )}
        </div>
      </section>

      {/* ===========================
          GUARDAR
      =========================== */}

      <button
        type="button"
        disabled={
          saving
        }
        onClick={
          saveSettings
        }
        className={`w-full text-white py-4 rounded-2xl font-semibold transition ${
          saving
            ? "bg-gray-300"
            : "bg-[#C8A96A] hover:opacity-90"
        }`}
      >
        {saving
          ? "A guardar..."
          : "Guardar Definições"}
      </button>
    </main>
  );
}

export default Settings;