import moment from "moment";
import { Service } from ".";
import Log from "../libs/logger";
import { DailyBalanceModel, IDailyBalance } from "../models/dailyBalance";

import { paymentService } from "./payment";
import { withdrawalService } from "./withdrawal";

export class DailyBalanceService extends Service<IDailyBalance> {
  constructor() {
    super(DailyBalanceModel);
  }

  /** Procesar las ventas en un fecha */
  async processMovements(companyCode: string, logger: Log): Promise<void> {
    try {
      logger.info(`Procesando
         ventas de la compañia: ${companyCode}`);
      let dailyBalance: IDailyBalance;
      const date = moment().format("YYYY/MM/DD");
      /** Buscar ultimo cierre de la compañia */
      const balance = await dailyBalanceService.findOne(
        {
          companyCode: companyCode,
        },
        {},
        { sort: { date: -1 } }
      );
      /** Si no esta cerrado seguimos procesando */
      if (moment(balance.date).format("YYYY/MM/DD") !== date) {
        if (balance.state === "pending") {
          dailyBalance = balance;
        } else {
        }
      }
    } catch (error) {
      logger.error(error, `Error al ´procesar las ventas: ${error.message}`);
    }
  }
  async closeBalance(
    companyCode: string,
    realAmountCash: number,
    realAmountTransfer: number
  ): Promise<IDailyBalance> {
    try {
      /** Buscamos balance pendiente de cierre */
      const closedTime = new Date();
      closedTime.setHours(closedTime.getHours() - 3);
      const balance: IDailyBalance = await this.findOne(
        {
          companyCode: companyCode,
          state: "pending",
        },
        {}
      );
      /** Buscamos movimientos no procesados y retiros y calculamos totales*/
      let totalWithdrawalCash = 0;
      let totalWithdrawalTransfer = 0;
      let totalPaymentsTransfer: number = 0;
      let totalPaymentsCash: number = 0;
      const payments = await paymentService.find({
        companyCode: companyCode,
        processed: { $eq: false },
      });
      const withdrawals = await withdrawalService.find({
        companyCode: companyCode,
        processed: { $eq: false },
      });
      for (const pay of payments) {
        pay.paymentMenthod.name.toLocaleLowerCase() != "efectivo"
          ? (totalPaymentsTransfer += pay.amount)
          : (totalPaymentsCash += pay.amount);
      }
      for (const item of withdrawals) {
        item.type.toLocaleLowerCase() != "efectivo"
          ? (totalWithdrawalTransfer += item.amount)
          : (totalWithdrawalCash += item.amount);
      }
      /** Actualizamos balance */
      balance.closedTime = closedTime;
      balance.finalAmountCash =
        (balance.initialAmountCash ?? 0) +
        totalPaymentsCash -
        totalWithdrawalCash;
      balance.finalAmountTransfer =
        (balance.initialAmountTransfer ?? 0) +
        totalPaymentsTransfer -
        totalWithdrawalTransfer;
      balance.totalWithdrawalTransfer = totalWithdrawalTransfer;
      balance.totalWithdrawalCash = totalWithdrawalCash;
      balance.state = "closed";
      balance.realAmountCash = realAmountCash;
      balance.finalAmountTransfer = realAmountTransfer;
      await this.findOneAndUpdate({ _id: balance._id }, balance);

      /** Marcamos pagos y retiros como procesados */
      await paymentService.updateMany(
        { companyCode: companyCode, processed: { $eq: false } },
        { processed: true }
      );
      await withdrawalService.updateMany(
        { companyCode: companyCode, processed: { $eq: false } },
        { processed: true }
      );
      return balance;
    } catch (error) {
      throw error;
    }
  }

  async generateIdentificationNumber(): Promise<number> {
    try {
      const lastBalance = await this.findOne(
        {},
        {},
        { sort: { identificationNumber: -1 } }
      );

      return lastBalance ? (lastBalance.identificationNumber ?? 0) + 1 : 1;
    } catch (error) {
      throw error;
    }
  }
}

export const dailyBalanceService = new DailyBalanceService();
