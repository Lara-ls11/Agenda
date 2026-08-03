import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";
import useServices from "../hooks/useServices";

function Service() {
  const navigate = useNavigate();

  const { services, loading } = useServices();

  const [selected, setSelected] = useState([]);

  const groupedServices = useMemo(() => {
    return services.reduce((groups, service) => {
      if (!groups[service.category]) {
        groups[service.category] = [];
      }

      groups[service.category].push(service);

      return groups;
    }, {});
  }, [services]);

  function toggleService(service) {
    const exists = selected.some(
      (item) => item.id === service.id
    );

    if (exists) {
      setSelected((currentSelected) =>
        currentSelected.filter(
          (item) => item.id !== service.id
        )
      );
    } else {
      setSelected((currentSelected) => [
        ...currentSelected,
        service,
      ]);
    }
  }

  function continueBooking() {
    localStorage.setItem(
      "services",
      JSON.stringify(selected)
    );

    navigate("/calendario");
  }

  return (
    <main className="min-h-screen bg-[#FAF8F6] px-6 py-10">
      <div className="max-w-xl mx-auto">
        <img
          src={logo}
          alt="Mónica Lima"
          className="w-28 mx-auto mb-6"
        />

        <h1 className="title text-5xl text-center text-[#3D3D3D] mb-3">
          Escolha os serviços
        </h1>

        <p className="text-center text-gray-500 mb-10">
          Pode selecionar um ou mais serviços.
        </p>

        {loading && (
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
            <p className="text-gray-500">
              A carregar serviços...
            </p>
          </div>
        )}

        {!loading && services.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
            <p className="text-gray-500">
              Não existem serviços disponíveis.
            </p>
          </div>
        )}

        {!loading &&
          Object.entries(groupedServices).map(
            ([category, categoryServices]) => (
              <section
                key={category}
                className="mb-8"
              >
                <h2 className="text-2xl font-semibold text-[#C8A96A] mb-4">
                  {category}
                </h2>

                <div className="space-y-3">
                  {categoryServices.map((service) => {
                    const active = selected.some(
                      (item) => item.id === service.id
                    );

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() =>
                          toggleService(service)
                        }
                        className={`w-full rounded-2xl border p-5 transition-all flex justify-between items-center ${
                          active
                            ? "bg-[#C8A96A] border-[#C8A96A] text-white"
                            : "bg-white border-[#ECE6E2] hover:border-[#C8A96A]"
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-medium">
                            {service.name}
                          </p>

                          <p
                            className={`text-sm ${
                              active
                                ? "text-white/80"
                                : "text-gray-500"
                            }`}
                          >
                            {service.duration} min
                          </p>
                        </div>

                        <div className="text-2xl">
                          {active ? "✓" : "○"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )
          )}

        <div className="sticky bottom-5 mt-10">
          <div className="bg-white rounded-3xl shadow-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <span>Serviços selecionados</span>

              <strong>{selected.length}</strong>
            </div>

            <button
              type="button"
              onClick={continueBooking}
              disabled={selected.length === 0}
              className={`w-full py-4 rounded-2xl font-semibold transition ${
                selected.length === 0
                  ? "bg-gray-300 text-gray-500"
                  : "bg-[#C8A96A] text-white hover:opacity-90"
              }`}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Service;