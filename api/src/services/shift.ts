import { Service } from ".";
import { IShift, ShiftModel } from "../models/shift";

export class ShiftService extends Service<IShift> {
  constructor() {
    super(ShiftModel);
  }
}

export const shiftService = new ShiftService();
