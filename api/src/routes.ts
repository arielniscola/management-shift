import { defineRoutes } from "./routes/index";
import { ProductController } from "./controllers/product";
import { PaymentMethodController } from "./controllers/paymentMethod";
import { MovementController } from "./controllers/movements";
import { DailyBalanceController } from "./controllers/dailyBalance";
import { ClientController } from "./controllers/client";
import { CompanyController } from "./controllers/company";
import { ShiftController } from "./controllers/shift";
import { UnitBusinessController } from "./controllers/unitBusiness";

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
        path: "/movement/lasts",
        label: "Ventas",
        method: "get",
        controller: MovementController.findLast,
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
      {
        path: "/movement/:id",
        label: "Eliminar Ventas",
        method: "delete",
        controller: MovementController.delete,
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
      // Clients
      {
        path: "/clients",
        label: "Buscar Clientes",
        method: "get",
        controller: ClientController.find,
        auth: false,
      },
      {
        path: "/clients",
        label: "Crear Clientes",
        method: "post",
        controller: ClientController.create,
        auth: false,
      },
      {
        path: "/clients",
        label: "Actualizar Clientes",
        method: "put",
        controller: ClientController.update,
        auth: false,
      },
      {
        path: "/clients/:id",
        label: "Eliminar cliente",
        method: "delete",
        controller: ClientController.delete,
        auth: false,
      },
      {
        path: "/clients/:id",
        label: "Movimientos cliente",
        method: "get",
        controller: ClientController.getMovementClient,
        auth: false,
      },
      // Compañias
      {
        path: "/company",
        label: "Compañia",
        method: "post",
        controller: CompanyController.create,
        auth: false,
      },
      // Turnos
      {
        path: "/shifts",
        label: "Turnos",
        method: "post",
        controller: ShiftController.create,
        auth: false,
      },
      {
        path: "/shifts",
        label: "Turnos",
        method: "get",
        controller: ShiftController.find,
        auth: false,
      },
      {
        path: "/shifts",
        label: "Turnos",
        method: "put",
        controller: ShiftController.update,
        auth: false,
      },
      {
        path: "/shifts/:id",
        label: "Turnos",
        method: "delete",
        controller: ShiftController.delete,
        auth: false,
      },
      // Unidad de negocios
      {
        path: "/unitBusiness",
        label: "Turnos",
        method: "post",
        controller: UnitBusinessController.create,
        auth: false,
      },
      {
        path: "/unitBusiness",
        label: "Unidad de Negocio",
        method: "get",
        controller: UnitBusinessController.find,
        auth: false,
      },
      {
        path: "/unitBusiness",
        label: "Unidad de Negocio",
        method: "put",
        controller: UnitBusinessController.update,
        auth: false,
      },
      {
        path: "/unitBusiness/:id",
        label: "Unidad de Negocio",
        method: "delete",
        controller: UnitBusinessController.delete,
        auth: false,
      },
    ],
  },
]);

export default routes;
