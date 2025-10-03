// import moment from "moment";
// import Log from "../libs/logger";
// import Process from "../libs/process";
// import { ICompany } from "../models/company";
// import { companyService } from "../services/company";
// import { dailyBalanceService } from "../services/dailyBalance";
// import { movementService } from "../services/movements";
// import { IDailyBalance } from "../models/dailyBalance";
// const logger = new Log("process.dailyBalanceSales");

// async function dailyBalanceSales(company: ICompany) {
//   try {
//     logger.info("Iniciando Proceso");

//     const startDate = moment(new Date())
//       .subtract(1, "days")
//       .format("YYYY/MM/DD");
//     const endDate = moment(new Date())
//       .set({ hour: 2, minute: 0, second: 0, millisecond: 0 })
//       .format("YYYY/MM/DD HH:mm");
//     /** Buscar ventas de la fecha */
//     const movements = await movementService.find({
//       date: { $gte: startDate, $lte: endDate },
//       companyCode: "temploPadel",
//     });
//     if (!movements.length) {
//       logger.info("No hay movimientos pendientes");
//       return;
//     }
//     /** Calcular el total */
//     let totalAmount = 0;
//     for (const mov of movements) {
//       totalAmount += mov.totalAmount;
//     }
//     /** Crear cierre diario */
//     const balance: IDailyBalance = {
//       companyCode: "templePadel",
//       closedTime: new Date(),
//       date: new Date(),
//       finalAmount: 1,
//       state: "closed",

//     };
//     /** Procesar ventas - Actualizar estado */
//     await movementService.updateMany({}, movements, { processed: true });

//     await dailyBalanceService.insertOne(balance);
//     logger.info("Proceso finalizado");
//   } catch (error) {
//     logger.error(error, `Error al procesar ventas: ${error.message}`);
//   }
// }

// export default new Process(
//   {
//     code: "dailyBalanceSales",
//     name: "dailyBalanceSales",
//     description: "Realiza balance de ventas diaria",
//     cronVar: "dailyBalanceSales",
//   },
//   async () => {
//     const companies = await companyService.find({ active: true });
//     for (const company of companies) {
//       await dailyBalanceSales(company);
//     }
//   }
// );
