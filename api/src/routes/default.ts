import { IRoute } from ".";
import { ProductController } from "../controllers/product";

export const CONFIG_MENU: IRoute[] = [];
export const BUSINESS_MENU: IRoute[] = [
  {
    path: "/product",
    label: "Productos",
    method: "get",
    controller: ProductController.find,
  },
  {
    path: "/product",
    label: "Crear Producto",
    method: "post",
    controller: ProductController.create,
    auth: false,
  },
];

/** Asociacion entre tipo de menu y sus rutas */
export const MENU_TYPES_ROUTES: { [key: string]: IRoute[] } = {
  config: CONFIG_MENU,
  business: BUSINESS_MENU,
};
