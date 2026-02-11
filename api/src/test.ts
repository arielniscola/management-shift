import ShifManagement, { defineOptions } from ".";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const CONFIGS = defineOptions({
  server: {
    port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000,
    secret: "secret",
  },
  db: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/shiftmanagement",
  },
  logs: {
    path: process.env.LOGS_PATH || "logs",
    prefix: "shiftmanagement",
    frequency: "1m",
  },
  bootstrapScripts: [],
  routes,
});

(async () => {
  const shiftmanagement = new ShifManagement(CONFIGS);
  await shiftmanagement.init();
})();
