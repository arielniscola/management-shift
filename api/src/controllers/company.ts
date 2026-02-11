import Log from "../libs/logger";
import { ICompany } from "../models/company";
import { IRouteController } from "../routes/index";
import { companyService } from "../services/company";

export class CompanyController {
  static find: IRouteController<{}, {}, {}, { code: string; active: boolean }> =
    async (req, res) => {
      const logger = new Log(res.locals.requestId, "CompanyController.find");
      try {
        const companyCode = res.locals.companyCode;
        const filter = {
          ...{ companyCode: companyCode },
          ...(req.query.code ? { code: req.query.code } : {}),
          ...(req.query.code ? { active: true } : {}),
        };
        const data = await companyService.find(filter);
        return res.status(200).json({ ack: 0, data: data });
      } catch (e) {
        logger.error(e);
        return res.status(400).json({ ack: 1, message: e.message });
      }
    };

  static create: IRouteController = async (req, res) => {
    const logger = new Log(res.locals.requestId, "CompanyController.create");
    try {
      const companyCode = res.locals.companyCode;
      const company: ICompany = req.body;

      // const valid = await companyService.validate(company);
      // if (valid.errors) throw valid.message;

      const created = await companyService.insertOne(company);

      if (!created) throw "Compañia no fue creada";
      return res
        .status(200)
        .json({ ack: 0, message: "Compañia creada correctamente" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 0, message: e.message });
    }
  };

  static update: IRouteController = (req, res) => {
    const logger = new Log(res.locals.requestId, "CompanyController.update");
    try {
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ message: e.message });
    }
  };

  static validateSuperAdminPassword: IRouteController<
    {},
    {},
    { password: string }
  > = async (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "CompanyController.validateSuperAdminPassword"
    );
    try {
      const companyCode = res.locals.companyCode;
      const { password } = req.body;

      if (!password) {
        return res
          .status(400)
          .json({ ack: 1, message: "Contraseña requerida" });
      }

      const companies = await companyService.find({ code: companyCode });
      if (!companies || companies.length === 0) {
        return res
          .status(400)
          .json({ ack: 1, message: "Compañía no encontrada" });
      }

      const company = companies[0];

      if (!company.superAdminPassword) {
        return res
          .status(400)
          .json({ ack: 1, message: "No se ha configurado una contraseña de super admin" });
      }

      if (password === company.superAdminPassword) {
        return res.status(200).json({ ack: 0, message: "Contraseña válida" });
      } else {
        return res
          .status(200)
          .json({ ack: 1, message: "Contraseña incorrecta" });
      }
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static setSuperAdminPassword: IRouteController<
    {},
    {},
    { password: string }
  > = async (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "CompanyController.setSuperAdminPassword"
    );
    try {
      const companyCode = res.locals.companyCode;
      const { password } = req.body;

      if (!password) {
        return res
          .status(400)
          .json({ ack: 1, message: "Contraseña requerida" });
      }

      const updated = await companyService.updateOne(
        { code: companyCode },
        { superAdminPassword: password }
      );

      if (!updated) {
        return res
          .status(400)
          .json({ ack: 1, message: "No se pudo actualizar la contraseña" });
      }

      return res
        .status(200)
        .json({ ack: 0, message: "Contraseña actualizada correctamente" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };
}
