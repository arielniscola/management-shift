import { Service } from ".";
import { IMovement, MovementModel } from "../models/movements";

export class MovementService extends Service<IMovement> {
  constructor() {
    super(MovementModel);
  }

  async generateMovementNumber(companyCode: string) {
    /** Buscarmos el ultimo movimiento */
    const lastMovement = await super.findOne(
      { companyCode: companyCode },
      {},
      { sort: { _id: -1 } }
    );
    const lastIdentificationNumber = lastMovement.identifacationNumber
      ? parseInt(lastMovement.identifacationNumber)
      : 0;
    let newIdentificationNumber = (lastIdentificationNumber + 1).toString();
    newIdentificationNumber =
      "0".repeat(10 - newIdentificationNumber.length) + newIdentificationNumber;
    return newIdentificationNumber;
  }
}

export const movementService = new MovementService();
