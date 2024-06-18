import { DB } from "./libs/db";
import Log from "./libs/logger";
import processManager from "./libs/processManager";
import { IRoutes } from "./routes";
import { AlertConfig } from "./services/alertConfig";

export interface IShiftManagementOptions {
  /**
   * Parametros de configuracion del servidor
   */
  server: {
    port: number;
    secret: string;
    ssl?: boolean;
  };
  /**
   * Parametros de configuracion de la BD
   */
  db: {
    /**
     * URI de conexion
     */
    uri: string;
  };
  /**
   * Scripts a ejecutar en el arranque
   * @defaultValue []
   */
  bootstrapScripts: Function[];
  routes: IRoutes;
  /**
   * Path de los procesos
   */
  processesPath?: string;
  /**
   * Version a mostrar en consola
   */
  version?: string;
  /**
   * Configuracion de Logs
   */
  logs?: {
    /**
     * Path de los logs
     */
    path?: string;
    /**
     * Prefijo para los logs
     */
    prefix?: string;
    /**
     * Frecuencia de logeo
     * @defaultValue 15m
     */
    frequency?: string;
  };
  /**
   * Alertas
   */
  alerts?: AlertConfig[];
}

const defaultOptions: IShiftManagementOptions = {
  server: {
    port: 3000,
    secret: "secret",
  },
  db: {
    uri: "mongodb://localhost:27017/shiftmanagement",
  },
  bootstrapScripts: [],
  routes: [],
  version: "",
  logs: {
    path: "./log",
    prefix: "shiftmanagement",
    frequency: "15m",
  },
  alerts: [],
};

/**
 * Shift Management
 * @version 1.0.0
 * @author Ariel Niscola
 * @description Clase que inicializa servidor
 */

export class ShifManagement {
  /** Opciones de ininializacion */
  private static _options: IShiftManagementOptions;
  /** Flag para verificar si ha sido inicializada */
  private _initialized: boolean = false;

  constructor(options?: Partial<IShiftManagementOptions>) {
    this.setOptions(options);
  }

  private setOptions(
    options: Partial<IShiftManagementOptions> = defaultOptions
  ) {
    ShifManagement._options = {
      ...defaultOptions,
      ...options,
    };
  }

  /**
   * Iniciar aplicacion
   */

  async init() {
    const log = new Log("ShifManagement.init()");
    try {
      /** Checkear que servidor no este inicializado */
      if (this._initialized) {
        throw new Error("Servidor ya inicializado");
      }
      log.info("Iniciando servicios api");

      const options = ShifManagement._options;

      /** Conexion a la BD */
      await DB.connect(options.db.uri);

      /**
       * Leemos los procesos disponibles
       */
      processManager.loadProcesses(options.processesPath);

      /** Marcamos al Servidor como inicializado */
      log.info(`Servidor inicializado: ${this._initialized}`);
      this._initialized = true;
    } catch (err) {
      log.error(err, `Error al iniciar servidor: ${err.message}`);
      throw err;
    }
  }
  /**
   * Obtiene configuracion
   * @param code Codigo de configuracion
   * @returns Valor de configuracion
   * @example
   * const port = ShifManagement.get('server.port')
   */
  static get(code: string): any {
    const value = code
      .split(".")
      .reduce((o: any, i) => o[i], ShifManagement._options);
    return value;
  }
}
export const defineOptions = (data: IShiftManagementOptions) => data;
export default ShifManagement;
