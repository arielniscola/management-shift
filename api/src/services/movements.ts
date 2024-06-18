import { Service } from ".";
import { IMovement, MovementModel } from "../models/movements";

export class MovementService extends Service<IMovement> {
  constructor() {
    super(MovementModel);
  }
}

export const movementService = new MovementService();
