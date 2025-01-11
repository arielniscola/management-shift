import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import "./css/style.css";

// Import pages
import Dashboard from "./pages/Dashboard";
import DailyMovements from "./pages/DailyMovements";
import PaymentMethod from "./pages/PaymentMethod/PaymentMethod";
import Product from "./pages/Product/Product";
import ProductForm from "./pages/Product/Form";
import Sales from "./pages/movement/Sales";
import PaymentMethodForm from "./pages/PaymentMethod/form";
import ClientView from "./pages/client/clientsView";
import CalendarMenu from "./pages/calendar/CalendarMenu";
import UnitBusiness from "./pages/unitBusiness/unitBusiness";

function App() {
  const location = useLocation();

  useEffect(() => {
    const element = document.querySelector("html");
    if (element) element.style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    if (element) element.style.scrollBehavior = "";
  }, [location.pathname]); // triggered on route change

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/settings/products" element={<Product />} />
        <Route path="/product/form/:id?" element={<ProductForm />} />
        <Route path="/daily-movement" element={<DailyMovements />} />
        <Route path="/settings/payment-methods" element={<PaymentMethod />} />
        <Route path="/settings/unit-business" element={<UnitBusiness />} />
        <Route
          path="/payment-methods/form/:id?"
          element={<PaymentMethodForm />}
        />
        <Route path="/clients" element={<ClientView />} />
        <Route path="/shift" element={<CalendarMenu />} />
      </Routes>
    </>
  );
}

export default App;
