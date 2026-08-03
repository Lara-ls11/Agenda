import {
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Service from "./pages/Service";
import CalendarPage from "./pages/Calendar";
import Customer from "./pages/Customer";
import Success from "./pages/Success";

import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import PendingBookings from "./pages/admin/PendingBookings";
import CalendarAdmin from "./pages/admin/CalendarAdmin";
import Clients from "./pages/admin/Clients";
import ServicesAdmin from "./pages/admin/ServicesAdmin";
import Settings from "./pages/admin/Settings";
import BookingDetails from "./pages/admin/BookingDetails";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Área das clientes */}
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/servicos"
        element={<Service />}
      />

      <Route
        path="/calendario"
        element={<CalendarPage />}
      />

      <Route
        path="/cliente"
        element={<Customer />}
      />

      <Route
        path="/sucesso"
        element={<Success />}
      />

      {/* Login da administração */}
      <Route
        path="/admin"
        element={<Login />}
      />

      {/* Rotas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/admin/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/admin/pedidos"
            element={<PendingBookings />}
          />

          <Route
            path="/admin/pedido/:id"
            element={<BookingDetails />}
          />

          <Route
            path="/admin/agenda"
            element={<CalendarAdmin />}
          />

          <Route
            path="/admin/clientes"
            element={<Clients />}
          />

          <Route
            path="/admin/servicos"
            element={<ServicesAdmin />}
          />

          <Route
            path="/admin/definicoes"
            element={<Settings />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;