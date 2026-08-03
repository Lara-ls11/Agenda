function ServiceCard({
  service,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 flex justify-between items-center">

      <div>

        <h3 className="text-lg font-semibold text-[#3D3D3D]">
          {service.name}
        </h3>

        <p className="text-gray-500">
          {service.duration} minutos
        </p>

      </div>

      <div className="flex gap-3">

        <button
          onClick={onEdit}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-xl"
        >
          Editar
        </button>

        <button
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl"
        >
          Eliminar
        </button>

      </div>

    </div>
  );
}

export default ServiceCard;