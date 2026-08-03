import { useEffect, useState } from "react";

const emptyService = {
  category: "Unhas",
  name: "",
  duration: "",
};

function ServiceForm({
  open,
  editingService,
  onSave,
  onCancel,
}) {
  const [service, setService] = useState(emptyService);

  useEffect(() => {
    if (editingService) {
      setService({
        category: editingService.category,
        name: editingService.name,
        duration: editingService.duration,
      });
    } else {
      setService(emptyService);
    }
  }, [editingService]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();

    if (!service.name.trim()) {
      alert("Introduz o nome do serviço.");
      return;
    }

    if (!service.duration) {
      alert("Introduz a duração.");
      return;
    }

    onSave({
      ...service,
      duration: Number(service.duration),
    });
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 mb-10">

      <h2 className="text-2xl font-semibold text-[#3D3D3D] mb-6">
        {editingService ? "Editar Serviço" : "Novo Serviço"}
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <select
            value={service.category}
            onChange={(e) =>
              setService({
                ...service,
                category: e.target.value,
              })
            }
            className="border border-gray-300 rounded-xl p-3"
          >
            <option>Unhas</option>
            <option>Pedicure</option>
            <option>Depilação</option>
            <option>Estética</option>
          </select>

          <input
            type="text"
            placeholder="Nome do serviço"
            value={service.name}
            onChange={(e) =>
              setService({
                ...service,
                name: e.target.value,
              })
            }
            className="border border-gray-300 rounded-xl p-3"
          />

          <input
            type="number"
            placeholder="Duração (min)"
            value={service.duration}
            onChange={(e) =>
              setService({
                ...service,
                duration: e.target.value,
              })
            }
            className="border border-gray-300 rounded-xl p-3"
          />

        </div>

        <div className="flex gap-4 mt-6">

          <button
            type="submit"
            className="bg-[#C8A96A] text-white px-6 py-3 rounded-xl hover:opacity-90"
          >
            {editingService
              ? "Guardar Alterações"
              : "Guardar"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 px-6 py-3 rounded-xl"
          >
            Cancelar
          </button>

        </div>

      </form>

    </div>
  );
}

export default ServiceForm;