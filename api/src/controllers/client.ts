import Log from "../libs/logger";
import { IRouteController } from "../routes/index";
import { ObjectId } from "mongoose";
import { clientService } from "../services/client";
import { IClient } from "../models/client";
import { movementService } from "../services/movements";

export class ClientController {
  static find: IRouteController<{}, {}, {}, { id: string | ObjectId }> = async (
    req,
    res
  ) => {
    const logger = new Log(res.locals.requestId, "ClientController.find");
    try {
      const companyCode = res.locals.companyCode;

      const filter = {
        ...{ companyCode: companyCode },
        ...(req.query.id ? { id: req.query.id } : {}),
      };
      const data: IClient[] = await clientService.find(
        filter,
        {},
        { sort: { firstname: 1 } }
      );

      /** Buscar movimientos impagos de clientes */
      const movements = await movementService.find({
        client: { $in: data.map((c) => c._id) },
        companyCode: companyCode,
        state: "debit",
      });

      for (const c of data) {
        if (movements.some((m) => m.client.toString() === c._id.toString())) {
          c.debt = true;
        }
      }
      return res.status(200).json({ ack: 0, data: data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static create: IRouteController = async (req, res) => {
    const logger = new Log(res.locals.requestId, "ClientController.create");
    try {
      const companyCode = res.locals.companyCode;
      const client: IClient = req.body;
      delete client._id;
      client.companyCode = companyCode;
      const created = await clientService.insertOne(client);
      if (!created) throw new Error("No se creo el cliente");
      return res
        .status(200)
        .json({ ack: 0, message: "Se creo cliente correctamente" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static update: IRouteController = async (req, res) => {
    const logger = new Log(res.locals.requestId, "ClientController.update");
    try {
      const companyCode = res.locals.companyCode;
      const client: IClient & { _id: ObjectId } = req.body;
      /** Verificar si existe */
      const exist = await clientService.findOne({
        _id: client._id,
      });
      if (!exist) throw new Error("Cliente no encontrado");
      const cliUpdated = await clientService.updateOne(
        { _id: client._id },
        client
      );
      if (!cliUpdated) throw new Error("Cliente no se actualizo");
      return res.status(200).json({ ack: 0, message: "Cliente actualizado" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static delete: IRouteController = async (req, res) => {
    const logger = new Log(res.locals.requestId, "ClientController.delete");
    try {
      const companyCode = res.locals.companyCode;
      const id = req.params.id;
      const deleted = await clientService.deleteOne({
        companyCode: companyCode,
        id: id,
      });
      if (!deleted) throw new Error("Cliente no eliminado");
      return res
        .status(200)
        .json({ ack: 0, message: "Cliente eliminado correctamente" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static getMovementClient: IRouteController = async (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "CLlentController.getMovements"
    );
    try {
      const id = req.params.id;
      if (!id) throw new Error("Cliente no seleccionado");
      const companyCode = res.locals.companyCode;

      const movements = await movementService.find(
        { client: id },
        {},
        { sort: { date: -1 } }
      );
      return res.status(200).json({ ack: 0, data: movements });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };
}
