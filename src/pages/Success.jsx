import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-PT").format(
    new Date(`${dateString}T12:00:00`)
  );
}

function Success() {
  const booking =
    JSON.parse(localStorage.getItem("lastBooking")) || {};

  return (
    <main className="min-h-screen bg-[#FAF8F6] px-6 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg p-8">
        <img
          src={logo}
          alt="Mónica Lima"
          className="w-24 mx-auto mb-6"
        />

        <h1 className="title text-4xl text-center text-[#C8A96A] mb-3">
          Pedido enviado!
        </h1>

        <p className="text-center text-gray-600 mb-8">
          O seu pedido foi registado e aguarda confirmação.
        </p>

        <div className="bg-[#FAF8F6] rounded-2xl p-5 mb-8">
          <p className="text-sm text-gray-500">
            Número do pedido
          </p>

          <p className="text-xl font-semibold text-[#3D3D3D]">
            #{booking.id}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-[#3D3D3D] mb-2">
              Serviços
            </h2>

            <ul className="space-y-1 text-gray-600">
              {booking.services?.map((service) => (
                <li key={service.id}>
                  • {service.name}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-[#3D3D3D] mb-2">
              Data
            </h2>

            <p className="text-gray-600">
              {formatDate(booking.date)}
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-[#3D3D3D] mb-2">
              Hora
            </h2>

            <p className="text-gray-600">
              {booking.time}
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-[#3D3D3D] mb-2">
              Cliente
            </h2>

            <p className="text-gray-600">
              {booking.customer?.name}
            </p>

            <p className="text-gray-600">
              {booking.customer?.phone}
            </p>

            {booking.customer?.email && (
              <p className="text-gray-600">
                {booking.customer.email}
              </p>
            )}

            {booking.customer?.notes && (
              <p className="mt-3 text-gray-500 italic">
                “{booking.customer.notes}”
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center mt-8">
          A marcação só fica confirmada depois de ser aceite.
        </p>

        <Link
          to="/"
          className="block w-full text-center bg-[#C8A96A] text-white py-4 rounded-2xl font-semibold mt-8 hover:opacity-90 transition"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}

export default Success;