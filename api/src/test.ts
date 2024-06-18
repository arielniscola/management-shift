import ShifManagement, { defineOptions } from ".";
import dotenv from "dotenv";
import { defineRoutes } from "./routes";
dotenv.config();

const CONFIGS = defineOptions({
  server: {
    port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000,
    secret: "secret",
  },
  db: {
    uri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shiftmanagement",
  },
  logs: {
    path: process.env.LOGS_PATH || "logs",
    prefix: "shiftmanagement",
    frequency: "1m",
  },
  bootstrapScripts: [],
  routes: defineRoutes([
    /** Dashboard */
    {
      label: "Dashboard",
      icon: "fa-chart-line",
      routes: [],
    },
    /** Negocio */
    {
      label: "Negocio",
      icon: "fa-store",
      type: "business",
      routes: [],
    },
    /** Documentos Fiscales */
    {
      label: "Documentos Fiscales",
      icon: "fa-file-invoice",
      routes: [],
    },
    /** Datos Maestros */
    {
      label: "Datos Maestros",
      icon: "fa-code",
      routes: [],
      type: "masterdata",
    },
    /** Monitoreo */
    {
      label: "Monitoreo",
      icon: "fa fa-desktop",
      routes: [],
      type: "monitoring",
    },
    /** Administracion */
    {
      label: "Administracion",
      icon: "fa fa-clipboard",
      routes: [],
      type: "administration",
    },
    /** Seguridad */
    {
      label: "Seguridad",
      icon: "fa-fingerprint",
      routes: [],
      type: "security",
    },
  ]),
});

(async () => {
  const shiftmanagement = new ShifManagement(CONFIGS);
  await shiftmanagement.init();
})();
