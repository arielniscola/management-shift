import { IConfig } from "../models/config";

/**
 * Configuraciones por defecto a crear para una compania
 */
export const DEFAULT_GLOBAL_SETTINGS: IConfig[] = [
  {
    type: "cron",
    code: "cronSendMail",
    name: "Multi-compañía: SYSTEM CRON: período de envío de correos electrónicos a los clientes",
    value: "* * * * *",
    dataType: "string",
    companyCode: "napse",
  },
  {
    type: "cron",
    code: "cleanLogs",
    name: "Multi-compañía: SYSTEM CRON: mantiene una depuración de los logs",
    value: "0 3 * * *",
    dataType: "string",
    companyCode: "napse",
  },
  {
    type: "cron",
    code: "alertRun",
    name: "Multi-compañía: SYSTEM CRON: ejecuta el envío de alarmas.",
    value: "*/5 * * * *",
    dataType: "string",
    companyCode: "napse",
  },
  {
    type: "server",
    code: "appLogLevel",
    name: "Multi-compañía: Nivel de log: 1 (Alto): Requests, logica interna y errores. 2 (Medio): Request y Errores. 3 (Bajo): Solo Errores",
    value: "1",
    dataType: "number",
    companyCode: "napse",
  },
  {
    type: "server",
    code: "maxDaysMaintainLogs",
    name: "Multi-compañía: Cantidad máxima de dias que se guardan los Logs",
    value: 30,
    dataType: "number",
    companyCode: "napse",
  },
];
