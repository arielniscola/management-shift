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
      const data = await clientService.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "movements",
            let: { clientId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$client", "$$clientId"] }, // Relación entre client y movement
                      { $eq: ["$companyCode", companyCode] },
                      { $eq: ["$state", "debit"] },
                    ],
                  },
                },
              },
              { $limit: 1 }, // Solo verificar si hay al menos un movimiento impago
            ],
            as: "unpaidMovements",
          },
        },
        {
          $addFields: { debt: { $gt: [{ $size: "$unpaidMovements" }, 0] } },
        },
        { $project: { unpaidMovements: 0 } }, // Remover el array innecesario
        { $sort: { firstname: 1 } },
      ]);
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

  static getMovementClient: IRouteController<
    { id: string },
    {},
    {},
    { page: number }
  > = async (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "CLlentController.getMovements"
    );
    try {
      const id = req.params.id;
      if (!id) throw new Error("Cliente no seleccionado");
      const count = await movementService.count({ client: id });
      const movements = await movementService.find(
        { client: id },
        {},
        { sort: { date: -1 }, skip: (req.query.page - 1) * 10, limit: 10 }
      );
      return res.status(200).json({ ack: 0, data: movements, total: count });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };
}
