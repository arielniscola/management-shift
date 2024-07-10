import { ObjectId } from "mongoose";
import Log from "../libs/logger";
import { IProduct } from "../models/products";
import { IRouteController } from "../routes/index";
import { productService } from "../services/products";

export class ProductController {
  static find: IRouteController<{}, {}, {}, { code?: string }> = async (
    req,
    res
  ) => {
    const logger = new Log(res.locals.requestId, "ProductoController.find");
    try {
      const companyCode = res.locals.companyCode;
      const filter = {
        ...{ companyCode: companyCode },
        ...(req.query.code ? { code: req.query.code } : {}),
      };
      const data: IProduct[] = await productService.find(filter);

      return res.status(200).json({ ack: 0, data: data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static create: IRouteController = async (req, res) => {
    const logger = new Log(res.locals.requestId, "ProductoController.create");
    try {
      const companyCode = res.locals.companyCode;
      const product: IProduct = req.body;
      product.companyCode = companyCode;
      /** Verificar si ya se encuentra creado dentro de la compañia */
      const exist = await productService.findOne({
        companyCode: product.companyCode,
        code: product.code,
      });
      if (exist) throw "Código de producto ya registrado";
      /** Verificar que sea un producto valido */
      const valid = await productService.validate(product);
      if (valid) throw valid.message;
      const created = await productService.insertOne(product);

      if (!created) throw "No se pudo a crear producto";

      return res.status(200).json({ ack: 0, message: "Producto creado" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static update: IRouteController = (req, res) => {
    const logger = new Log(res.locals.requestId, "ProductoController.update");
    try {
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ message: e.message });
    }
  };
}
