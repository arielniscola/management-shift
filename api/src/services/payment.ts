import { Service } from ".";
import { IPayment, PaymentModel } from "../models/payment";
import { movementService } from "./movements";

export class PaymentService extends Service<IPayment> {
  constructor() {
    super(PaymentModel);
  }

  async updateMovements(payment: IPayment, companyCode: string) {
    {
      try {
        if (payment.movementsNumber.length === 0) {
          const ids_movements: string[] = [];
          /** Si el pago no corresponde a un mov buscamos los no pagados */
          const movements = await movementService.find(
            {
              companyCode: companyCode,
              state: { $in: ["debit", "incomplete"] },
            },
            {},
            { sort: { date: 1 } }
          );
          /** Segun el monto pagado se van cambiando estados de los movimientos */
          let amount = payment.amount;
          while (amount > 0) {
            const movement = movements.shift();
            ids_movements.push(movement._id.toString());
            if (movement) {
              if (movement.totalAmount > amount) {
                await movementService.updateOne(
                  { _id: movement._id },
                  { state: "incomplete", amountPaid: amount }
                );
                amount = 0;
              } else {
                await movementService.updateOne(
                  { _id: movement._id },
                  { state: "paid", amountPaid: movement.totalAmount }
                );
                amount -= movement.totalAmount;
              }
            }
          }
          /** Actualizamos pago con facturas relacionadas */
          await this.updateOne(
            { _id: payment._id },
            { movementsNumber: ids_movements }
          );
        } else {
          /** Buscamos movimiento y comparamos los montos  */
          const movement = await movementService.findOne({
            identifacationNumber: payment.movementsNumber[0],
            companyCode: companyCode,
            state: { $in: ["debit", "incomplete"] },
          });
          if (!movement) throw new Error("No se encontro el movimiento");
          console.log(movement);

          if (
            Number(movement.totalAmount) >
            Number(payment.amount) + Number(movement.amountPaid)
          ) {
            await movementService.updateOne(
              { _id: movement._id, state: { $in: ["debit", "incomplete"] } },
              {
                state: "incomplete",
                amountPaid:
                  Number(payment.amount) + Number(movement.amountPaid),
              }
            );
            return;
          } else {
            await movementService.updateOne(
              { _id: movement._id, state: { $in: ["debit", "incomplete"] } },
              { state: "paid", amountPaid: movement.totalAmount }
            );
          }
        }
      } catch (error) {
        throw error;
      }
    }
  }
}

export const paymentService = new PaymentService();
