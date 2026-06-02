// SERVICIO DE AUTENTICACIÓN ADMIN \\

const jwt = require('jsonwebtoken');
require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

/**
 * Verifica la contraseña y genera un token con el rol correspondiente.
 * @param {string} password - Contraseña ingresada
 * @returns {{token: string, rol: string}|null}
 */
function login(password) {
    let rol = null;

    // El superadmin se chequea primero (es el de mayor privilegio)
    if (SUPERADMIN_PASSWORD && password === SUPERADMIN_PASSWORD) {
        rol = 'superadmin';
    } else if (password === ADMIN_PASSWORD) {
        rol = 'admin';
    }

    if (!rol) return null;

    const token = jwt.sign(
        { rol: rol },            // el rol queda guardado dentro del token
        TOKEN_SECRET,
        { expiresIn: '8h' }
    );

    return { token, rol };
}

/**
 * Verifica un token y devuelve sus datos (o null si es inválido).
 * @param {string} token
 * @returns {object|null} - { rol } si es válido, null si no
 */
function verificarToken(token) {
    try {
        return jwt.verify(token, TOKEN_SECRET); // devuelve el payload { rol, ... }
    } catch (error) {
        return null;
    }
}

/**
 * Saca el token del header Authorization: "Bearer xxxx"
 */
function extraerToken(request) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.split(' ')[1];
}

/**
 * Middleware: deja pasar a CUALQUIER admin válido (admin o superadmin).
 * Para todo lo del día a día.
 */
function protegerAdmin(request, response, next) {
    const token = extraerToken(request);
    const datos = token ? verificarToken(token) : null;

    if (!datos) {
        return response.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    request.usuario = datos; // { rol: 'admin' | 'superadmin' }
    next();
}

/**
 * Middleware: SOLO deja pasar al superadmin.
 * Para operaciones peligrosas (borrados permanentes, etc.).
 */
function protegerSuperadmin(request, response, next) {
    const token = extraerToken(request);
    const datos = token ? verificarToken(token) : null;

    if (!datos) {
        return response.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    if (datos.rol !== 'superadmin') {
        return response.status(403).json({ error: 'Esta acción requiere permisos de superadmin' });
    }

    request.usuario = datos;
    next();
}

module.exports = {
    login,
    verificarToken,
    protegerAdmin,
    protegerSuperadmin
};