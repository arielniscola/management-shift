import { defineRoutes } from "./routes/index";
import { ProductController } from "./controllers/product";
import { PaymentMethodController } from "./controllers/paymentMethod";
import { MovementController } from "./controllers/movements";
import { DailyBalanceController } from "./controllers/dailyBalance";

/**
 * Declaracion de Rutas.
 * Cada ruta pertenece a una agrupacion.
 * Cada agrupacion conformara un menu principal, y cada ruta, un sub-menu.
 *
 * Las rutas son un array donde cada objeto es un menu.
 * Cada menu tiene las propiedades:
 *  - label: Etiqueta del menu
 *  - icon: Icono a mostrar
 *  - routes: Un array de las rutas del menu (sub-menu)
 * Cada objeto en routes (sub-menu) tiene las propiedades:
 *  - path: Ruta absoluta al controlador
 *  - label: Etiqueta del sub-menu
 *  - method: Metodo HTTP
 *  - controller: Controlador para la ruta
 *  - auth: Define si requiere autenticacion. Por defecto true.
 *
 * Para ver todas las definiciones disponibles, ver la interfaz IRoute.
 */
const routes = defineRoutes([
  /** Negocio */
  {
    label: "Negocio",
    icon: "fa-store",
    type: "business",
    routes: [
      /** Menu Principal */
      // Producto
      {
        path: "/product",
        label: "Producto",
        method: "get",
        controller: ProductController.find,
        auth: false,
      },
      {
        path: "/product",
        label: "Producto",
        method: "post",
        controller: ProductController.create,
        auth: false,
      },
      {
        path: "/product",
        label: "Producto",
        method: "put",
        controller: ProductController.update,
        auth: false,
      },
      {
        path: "/product/:id",
        label: "Eliminar producto",
        method: "delete",
        controller: ProductController.delete,
        auth: false,
      },
      // Metodos de pago
      {
        path: "/paymentMethod",
        label: "Metodo de pago",
        method: "get",
        controller: PaymentMethodController.find,
        auth: false,
      },
      {
        path: "/paymentMethod",
        label: "Crear Metodo de pago",
        method: "post",
        controller: PaymentMethodController.create,
        auth: false,
      },
      {
        path: "/paymentMethod",
        label: "Actualizar Metodo de pago",
        method: "put",
        controller: PaymentMethodController.update,
        auth: false,
      },
      {
        path: "/paymentMethod/:id",
        label: "Eliminar Metodo de pago",
        method: "delete",
        controller: PaymentMethodController.delete,
        auth: false,
      },
      // Ventas
      {
        path: "/movement",
        label: "Ventas",
        method: "get",
        controller: MovementController.find,
        auth: false,
      },
      {
        path: "/movement",
        label: "Crear Ventas",
        method: "post",
        controller: MovementController.create,
        auth: false,
      },
      {
        path: "/movement",
        label: "Actualizar Ventas",
        method: "put",
        controller: MovementController.update,
        auth: false,
      },
      // Balance Diario
      {
        path: "/daily-balance",
        label: "Cierre balance",
        method: "get",
        controller: DailyBalanceController.find,
        auth: false,
      },
    ],
  },
]);

export default routes;
