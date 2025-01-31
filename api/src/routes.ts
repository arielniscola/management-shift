import { defineRoutes } from "./routes/index";
import { ProductController } from "./controllers/product";
import { PaymentMethodController } from "./controllers/paymentMethod";
import { MovementController } from "./controllers/movements";
import { DailyBalanceController } from "./controllers/dailyBalance";
import { ClientController } from "./controllers/client";
import { CompanyController } from "./controllers/company";
import { ShiftController } from "./controllers/shift";
import { UnitBusinessController } from "./controllers/unitBusiness";
import UserController from "./controllers/user";
import { AuthenticationController } from "./controllers/authentication";

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
        auth: true,
      },
      {
        path: "/product",
        label: "Producto",
        method: "post",
        controller: ProductController.create,
        auth: true,
      },
      {
        path: "/product",
        label: "Producto",
        method: "put",
        controller: ProductController.update,
        auth: true,
      },
      {
        path: "/product/:id",
        label: "Eliminar producto",
        method: "delete",
        controller: ProductController.delete,
        auth: true,
      },
      // Metodos de pago
      {
        path: "/paymentMethod",
        label: "Metodo de pago",
        method: "get",
        controller: PaymentMethodController.find,
        auth: true,
      },
      {
        path: "/paymentMethod",
        label: "Crear Metodo de pago",
        method: "post",
        controller: PaymentMethodController.create,
        auth: true,
      },
      {
        path: "/paymentMethod",
        label: "Actualizar Metodo de pago",
        method: "put",
        controller: PaymentMethodController.update,
        auth: true,
      },
      {
        path: "/paymentMethod/:id",
        label: "Eliminar Metodo de pago",
        method: "delete",
        controller: PaymentMethodController.delete,
        auth: true,
      },
      // Ventas
      {
        path: "/movement",
        label: "Ventas",
        method: "get",
        controller: MovementController.find,
        auth: true,
      },
      {
        path: "/movement/lasts",
        label: "Ventas",
        method: "get",
        controller: MovementController.findLast,
        auth: true,
      },
      {
        path: "/movement",
        label: "Crear Ventas",
        method: "post",
        controller: MovementController.create,
        auth: true,
      },
      {
        path: "/movement",
        label: "Actualizar Ventas",
        method: "put",
        controller: MovementController.update,
        auth: true,
      },
      {
        path: "/movement/:id",
        label: "Eliminar Ventas",
        method: "delete",
        controller: MovementController.delete,
        auth: true,
      },
      // Balance Diario
      {
        path: "/daily-balance",
        label: "Cierre balance",
        method: "get",
        controller: DailyBalanceController.find,
        auth: true,
      },
      // Clients
      {
        path: "/clients",
        label: "Buscar Clientes",
        method: "get",
        controller: ClientController.find,
        auth: true,
      },
      {
        path: "/clients",
        label: "Crear Clientes",
        method: "post",
        controller: ClientController.create,
        auth: true,
      },
      {
        path: "/clients",
        label: "Actualizar Clientes",
        method: "put",
        controller: ClientController.update,
        auth: true,
      },
      {
        path: "/clients/:id",
        label: "Eliminar cliente",
        method: "delete",
        controller: ClientController.delete,
        auth: true,
      },
      {
        path: "/clients/:id",
        label: "Movimientos cliente",
        method: "get",
        controller: ClientController.getMovementClient,
        auth: true,
      },
      // Compañias
      {
        path: "/company",
        label: "Compañia",
        method: "post",
        controller: CompanyController.create,
        auth: true,
      },
      // Turnos
      {
        path: "/shifts",
        label: "Turnos",
        method: "post",
        controller: ShiftController.create,
        auth: true,
      },
      {
        path: "/shifts",
        label: "Turnos",
        method: "get",
        controller: ShiftController.find,
        auth: true,
      },
      {
        path: "/shifts",
        label: "Turnos",
        method: "put",
        controller: ShiftController.update,
        auth: true,
      },
      {
        path: "/shifts/:id",
        label: "Turnos",
        method: "delete",
        controller: ShiftController.delete,
        auth: true,
      },
      {
        path: "/shifts/statistics",
        label: "Turnos",
        method: "get",
        controller: ShiftController.statistics,
        auth: true,
      },
      // Unidad de negocios
      {
        path: "/unitBusiness",
        label: "Turnos",
        method: "post",
        controller: UnitBusinessController.create,
        auth: true,
      },
      {
        path: "/unitBusiness",
        label: "Unidad de Negocio",
        method: "get",
        controller: UnitBusinessController.find,
        auth: true,
      },
      {
        path: "/unitBusiness",
        label: "Unidad de Negocio",
        method: "put",
        controller: UnitBusinessController.update,
        auth: true,
      },
      {
        path: "/unitBusiness/:id",
        label: "Unidad de Negocio",
        method: "delete",
        controller: UnitBusinessController.delete,
        auth: true,
      },
      // Users
      {
        path: "/users",
        label: "Usuarios",
        method: "post",
        controller: UserController.create,
        auth: false,
      },
      // Authentication
      {
        path: "/users/login",
        label: "Usuarios",
        method: "post",
        controller: AuthenticationController.login,
        auth: false,
      },
    ],
  },
]);

export default routes;
