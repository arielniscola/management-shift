import moment from "moment";
import Log from "../libs/logger";
import { IRouteController } from "../routes/index";
import { IMovement } from "../models/movements";
import { movementService } from "../services/movements";
import { dailyBalanceService } from "../services/dailyBalance";
import { IWithdrawal } from "../models/withdrawal";
import { IDailyBalance } from "../models/dailyBalance";
import { paymentService } from "../services/payment";
import { withdrawalService } from "../services/withdrawal";

export class DailyBalanceController {
  static find: IRouteController<{}, {}, {}, { date: string }> = async (
    req,
    res
  ) => {
    const logger = new Log(res.locals.requestId, "MovementController.find");
    try {
      const companyCode = res.locals.companyCode;
      const startDate = moment(req.query.date, "YYYY/MM/DD");
      const endDate = moment(req.query.date, "YYYY/MM/DD").endOf("day");
      const filter = {
        ...{ companyCode: companyCode },
        ...(req.query.date
          ? { date: { $gte: startDate.toDate(), $lte: endDate.toDate() } }
          : {}),
      };
      const movements = await movementService.find(
        filter,
        {},
        { populate: "client" }
      );

      const balance = await dailyBalanceService.findOne(filter);

      return res
        .status(200)
        .json({ ack: 0, data: { movements: movements, balance: balance } });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static closeBalance: IRouteController<
    {},
    {},
    { realAmountCash: number; realAmountTransfer: number },
    {}
  > = async (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "MovementController.closeBalance"
    );
    try {
      const companyCode = res.locals.companyCode;

      const { realAmountCash, realAmountTransfer } = req.body;
      /** Realizamos cierre de balance */
      const balanceClosed = await dailyBalanceService.closeBalance(
        companyCode,
        realAmountCash,
        realAmountTransfer
      );
      const initialDate = new Date();
      /** Validamos que no hay otro banlance pendiente creado */
      const existPending = await dailyBalanceService.findOne({
        companyCode: companyCode,
        state: "pending",
      });
      if (existPending)
        throw new Error(
          "Ya existe un balance pendiente de cierre. No se puede crear uno nuevo."
        );
      /** Creamos inicio de balance nuevo */
      await dailyBalanceService.insertOne({
        companyCode: companyCode,
        date: initialDate,
        state: "pending",
        finalAmountCash: 0,
        finalAmountTransfer: 0,
        initialAmountCash: balanceClosed.finalAmountCash,
        initialAmountTransfer: balanceClosed.finalAmountTransfer,
        totalWithdrawalCash: 0,
        totalWithdrawalTransfer: 0,
        identificationNumber:
          await dailyBalanceService.generateIdentificationNumber(),
        closedTime: null,
      });
      return res
        .status(200)
        .json({ ack: 0, message: "Balance cerrado correctamente" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static withdrawal: IRouteController = async (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "BalanceController.withdrawal"
    );
    try {
      const companyCode = res.locals.companyCode;
      const withdrawal: IWithdrawal = req.body;
      const date = new Date(); // Fecha actual
      withdrawal.date = date;
      withdrawal.companyCode = companyCode;
      const create = await withdrawalService.insertOne(withdrawal);
      if (!create) throw new Error("No se pudo registrar el retiro");
      return res.status(200).json({ ack: 0, message: "Retiro registrado" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static findPaymentsBalance: IRouteController<
    { id: number },
    {},
    {},
    { date: string }
  > = async (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "MovementController.withdrawal"
    );

    try {
      const identificationNumber = req.params.id;
      const companyCode = res.locals.companyCode;
      /** Buscamos balance */
      const balance: IDailyBalance =
        identificationNumber == 0
          ? await dailyBalanceService.findOne({
              companyCode: companyCode,
              state: "pending",
            })
          : await dailyBalanceService.findOne({
              companyCode: companyCode,
              identificationNumber: identificationNumber,
            });
      if (!balance) throw new Error("No se encontró el balance");

      const filter = {
        ...{ companyCode: companyCode },
        ...(balance.state === "closed"
          ? {
              date: {
                $gte: new Date(balance.date.getTime() + 3 * 60 * 60 * 1000),
                $lte: new Date(
                  balance.closedTime.getTime() + 3 * 60 * 60 * 1000
                ),
              },
            }
          : {
              date: {
                $gte: balance.date,
              },
            }),
      };
      /** Buscamos pagos y retiros correspondientes al cierre de caja */
      const payments = await paymentService.find(
        filter,
        {},
        { populate: "client", sort: { date: -1 } }
      );
      const withdrawals = await withdrawalService.find(filter, {});
      return res
        .status(200)
        .json({ ack: 0, data: { balance, payments, withdrawals } });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static getBalancesIds: IRouteController = async (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "MovementController.getBalancesIds"
    );
    try {
      const companyCode = res.locals.companyCode;
      const balances = await dailyBalanceService.find(
        { companyCode: companyCode },
        { identificationNumber: 1, date: 1, state: 1 },
        { sort: { identificationNumber: -1 } }
      );
      return res.status(200).json({ ack: 0, data: balances });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };
}
