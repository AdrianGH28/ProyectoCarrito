import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import session from 'express-session';
import { usuarios } from "./../controllers/authentication.controller.js";

dotenv.config();
function soloAdmin(req, res, next) {
    const loggeado = revisarCookie(req);
    if (loggeado) return next();
    return res.redirect("/admin");
}

function soloPublico(req, res, next) {
    const loggeado = revisarCookie(req);
    if (!loggeado) return next();
    return res.redirect("/principal");
}

function soloAlmacenista(req, res, next) {
    const loggeado = revisarCookie(req);
    if (!loggeado) return next();
    return res.redirect("/almacenista");
}
// Middleware para protección de rutas (autorización)

const proteccion = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).send({ status: "Error", message: "No autorizado" });
    }

    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send({ status: "Error", message: "Token inválido o expirado" });
    }
};
function revisarCookie(req) {
    try {
        if (!req.headers.cookie) {
            throw new Error("No cookies found");
        }

        const cookieJWT = req.headers.cookie.split("; ").find(cookie => cookie.startsWith("jwt="));
        if (!cookieJWT) {
            throw new Error("JWT cookie not found");
        }

        const token = cookieJWT.slice(4);
        const decodificada = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        
        const usuarioARevisar = usuarios.find(usuario => usuario.correo === decodificada.correo);
        if (!usuarioARevisar) {
            return false;
        }
        return usuarioARevisar;
    } catch (error) {
        console.error("Error al revisar la cookie:", error.message);
        return false;
    }
}

export const methods = {
    soloAdmin,
    soloPublico,
    proteccion,
};
