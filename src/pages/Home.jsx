import logo from "../assets/logo.png";
import Button from "../components/Button";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="min-h-screen bg-[#FAF8F6]">

      <section className="flex flex-col items-center text-center px-6 pt-20">

        <img
          src={logo}
          alt="Mónica Lima"
          className="w-48 mb-6"
        />

        <h1 className="title text-6xl text-[#3D3D3D]">
          Mónica Lima
        </h1>

        <p className="uppercase tracking-[5px] text-sm text-[#A58A5E] mt-2">
          Nails • Beauty Studio
        </p>

        <p className="max-w-md mt-8 text-gray-600 leading-8">
          Realce a sua beleza com serviços profissionais
          de unhas, pedicure, depilação e estética.
        </p>

        <div className="mt-10">
            <Link to="/servicos">
                <Button>Marcar Agora</Button>
            </Link>
        </div>

      </section>

    </main>
  );
}

export default Home;