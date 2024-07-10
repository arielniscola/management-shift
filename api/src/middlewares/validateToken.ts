import { RequestHandler } from "express";
import { INVALID_TOKEN_ERROR, MISSING_TOKEN_ERROR } from "../constants/errors";
import accessTokenService from "../services/accessToken";

/** Middleware para verificar el token de sesion */

export const validateToken: RequestHandler = async (req, res, next) => {
  try {
    /**
     * Verificamos si hay una session activa, en caso de que no, redirigimos al login.
     * Si encontramos la session activa, podemos verificar el token.
     */
    const token = req.session.token;
    /** Si no hay token, o es invalido, devolvemos error */
    if (!token) throw MISSING_TOKEN_ERROR;
    /** Si hay token, verificamos que sea valido */
    const payload = await accessTokenService.validateToken(token);
    if (!payload) throw INVALID_TOKEN_ERROR;

    /** Si el token es valido, continuamos con la ejecucion */
    res.locals.username = payload.username;
    res.locals.companyCode = payload.companyCode;
    /** Si es el usuario de la compania por defecto (superadministrador), permitir cambiar compania */
    //res.locals.isSuperCompany = payload.companyCode === DEFAULT_SUSER.companyCode
    next();
  } catch (error) {
    console.error(`validateToken() Error: ${error.message}`);

    /** Si tenemos un enlace de referencia, pasarlo como enlace para volver luego de iniciar sesion (backTo) */
    const backTo = req.headers["from"] || req.originalUrl;
    /** Si es una llamada a API desde la vista, retornar un error */
    if (req.headers["api"]) return res.status(401).json({ backTo });
    /** Si no, redirigir al login */
    return res.redirect(`/login?backTo=${backTo}`);
  }
};

export default validateToken;
