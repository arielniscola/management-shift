import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/login/login";
import Sales from "../pages/movement/Sales";
import ProtectedRoute from "./ProtectedRoutes";
import ClientView from "../pages/client/clientsView";
import Dashboard from "../pages/Dashboard";
import PaymentMethod from "../pages/PaymentMethod/PaymentMethod";
import Product from "../pages/Product/Product";
import UnitBusiness from "../pages/unitBusiness/unitBusiness";
import DailyMovements from "../pages/dailyMovements/DailyMovements";
import ShiftStatistics from "../pages/statistics/ShiftStatistics";
import Unauthorized from "../pages/unauthorized";
import { ShiftView } from "../pages/shift";
import Stock from "../pages/Stock/Stock";
import OpenTab from "../pages/OpenTab/OpenTab";
import OpenTabDetail from "../pages/OpenTab/OpenTabDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "login", element: <Login /> },
      {
        path: "",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "shift",
        element: (
          <ProtectedRoute>
            <ShiftView />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "sales",
        element: (
          <ProtectedRoute>
            <Sales />
          </ProtectedRoute>
        ),
      },
      {
        path: "clients",
        element: (
          <ProtectedRoute>
            <ClientView />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings/payment-methods",
        element: (
          <ProtectedRoute>
            <PaymentMethod />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings/products",
        element: (
          <ProtectedRoute>
            <Product />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings/unit-business",
        element: (
          <ProtectedRoute>
            <UnitBusiness />
          </ProtectedRoute>
        ),
      },
      {
        path: "/daily-movement",
        element: (
          <ProtectedRoute>
            <DailyMovements />
          </ProtectedRoute>
        ),
      },
      {
        path: "/statistics",
        element: (
          <ProtectedRoute>
            <ShiftStatistics />
          </ProtectedRoute>
        ),
      },
      {
        path: "/stock",
        element: (
          <ProtectedRoute>
            <Stock />
          </ProtectedRoute>
        ),
      },
      {
        path: "/open-tab",
        element: (
          <ProtectedRoute>
            <OpenTab />
          </ProtectedRoute>
        ),
      },
      {
        path: "/open-tab/:id",
        element: (
          <ProtectedRoute>
            <OpenTabDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "access-denied",
        element: <Unauthorized />,
      },
    ],
  },
]);
