import { defineRoutes } from "./routes/index";
import { ProductController } from "./controllers/product";

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
      /** Menu de Compañia */
      // Grilla
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
    ],
  },
]);

export default routes;
