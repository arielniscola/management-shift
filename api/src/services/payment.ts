import { Service } from ".";
import { IPayment, PaymentModel } from "../models/payment";
import { IProduct, ProductModel } from "../models/products";
import { movementService } from "./movements";

export class PaymentService extends Service<IPayment> {
  constructor() {
    super(PaymentModel);
  }

  async updateMovements(payment: IPayment, companyCode: string) {
    {
      try {
        if (payment.movementsNumber.length === 0) {
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
        } else {
          await movementService.updateMany(
            { identificationNumber: { $in: payment.movementsNumber } },
            { state: "paid" }
          );
        }
      } catch (error) {}
    }
  }
}

export const paymentService = new PaymentService();
