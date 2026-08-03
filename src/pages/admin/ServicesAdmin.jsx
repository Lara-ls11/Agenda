import { useEffect, useState } from "react";

import ServiceCard from "../../components/admin/ServiceCard";
import ServiceForm from "../../components/admin/ServiceForm";

import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../../services/services";

function ServicesAdmin() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);

      const data = await getServices();

      setServices(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar os serviços.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(service) {
    try {
      if (editingService) {
        await updateService(editingService.id, service);
      } else {
        await createService({
          ...service,
          active: true,
        });
      }

      setShowForm(false);
      setEditingService(null);

      await loadServices();
    } catch (error) {
      console.error(error);
      alert("Erro ao guardar o serviço.");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Tem a certeza que pretende eliminar este serviço?"
    );

    if (!confirmed) return;

    try {
      await deleteService(id);

      await loadServices();
    } catch (error) {
      console.error(error);
      alert("Erro ao eliminar.");
    }
  }

  function groupServices() {
    return services.reduce((groups, service) => {
      if (!groups[service.category]) {
        groups[service.category] = [];
      }

      groups[service.category].push(service);

      return groups;
    }, {});
  }

  const grouped = groupServices();

  return (
    <main>

      <div className="flex justify-between items-center mb-8">

        <h1 className="title text-4xl text-[#3D3D3D]">
          Serviços
        </h1>

        <button
          onClick={() => {
            setEditingService(null);
            setShowForm(true);
          }}
          className="bg-[#C8A96A] text-white px-6 py-3 rounded-2xl hover:opacity-90"
        >
          + Novo Serviço
        </button>

      </div>

      <ServiceForm
        open={showForm}
        editingService={editingService}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingService(null);
        }}
      />

      {loading && (
        <p>A carregar serviços...</p>
      )}

      {!loading &&
        Object.entries(grouped).map(([category, list]) => (

          <div
            key={category}
            className="mb-10"
          >

            <h2 className="title text-2xl text-[#C8A96A] mb-5">
              {category}
            </h2>

            <div className="space-y-4">

              {list.map((service) => (

                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={() => {
                    setEditingService(service);
                    setShowForm(true);
                  }}
                  onDelete={() =>
                    handleDelete(service.id)
                  }
                />

              ))}

            </div>

          </div>

        ))}

    </main>
  );
}

export default ServicesAdmin;