function ServiceCard({
  service,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-3xl border border-[#F0EBE6] shadow-sm p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Informação do serviço */}
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-[#3D3D3D]">
            {service.name}
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            {service.duration} minutos
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 sm:flex-shrink-0">

          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl bg-[#F7F2E9] px-4 py-2 text-sm font-medium text-[#9A7A3D] transition hover:bg-[#EFE5D3]"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl bg-[#FFF3F3] px-4 py-2 text-sm font-medium text-[#C46B6B] transition hover:bg-[#FDE7E7]"
          >
            Eliminar
          </button>

        </div>
      </div>
    </div>
  );
}

export default ServiceCard;