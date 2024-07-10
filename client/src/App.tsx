import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import "./css/style.css";

// Import pages
import Dashboard from "./pages/Dashboard";
import DailyMovements from "./pages/DailyMovements";
import PaymentMethod from "./pages/PaymentMethod";
import Product from "./pages/Product";
import Sales from "./pages/Sales";

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
        <Route path="/daily-movement" element={<DailyMovements />} />
        <Route path="/payment-methods" element={<PaymentMethod />} />
      </Routes>
    </>
  );
}

export default App;
