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
        <Route path="/product" element={<Product />} />
        <Route path="/product/form/:id?" element={<ProductForm />} />
        <Route path="/daily-movement" element={<DailyMovements />} />
        <Route path="/payment-methods" element={<PaymentMethod />} />
        <Route
          path="/payment-methods/form/:id?"
          element={<PaymentMethodForm />}
        />
      </Routes>
    </>
  );
}

export default App;
