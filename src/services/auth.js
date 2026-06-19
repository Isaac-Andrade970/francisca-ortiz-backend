// SERVICIO DE AUTENTICACIÓN ADMIN \\

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./firebase');
require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;          // respaldo inicial (bootstrap)
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

// Documento donde guardamos el hash de la contraseña de la admin (Francisca)
const DOC_CREDENCIALES = db.collection('config').doc('credenciales');

/**
 * Lee el hash de la contraseña de la admin desde Firestore.
 * Devuelve el hash, o null si todavía no se ha definido.
 */
async function obtenerHashAdmin() {
    const doc = await DOC_CREDENCIALES.get();
    if (!doc.exists) return null;
    return doc.data().adminPasswordHash || null;
}

/**
 * Cambia la contraseña de la admin (Francisca): la cifra y la guarda en Firestore.
 * Solo la usa el superadmin.
 */
async function cambiarPasswordAdmin(nuevaPassword) {
    const hash = await bcrypt.hash(nuevaPassword, 10);
    await DOC_CREDENCIALES.set({ adminPasswordHash: hash }, { merge: true });
}

/**
 * Verifica la contraseña y genera un token con el rol correspondiente.
 * @param {string} password
 * @returns {Promise<{token: string, rol: string}|null>}
 */
async function login(password) {
    let rol = null;

    // 1. Superadmin (contraseña fija en variable de entorno)
    if (SUPERADMIN_PASSWORD && password === SUPERADMIN_PASSWORD) {
        rol = 'superadmin';
    } else {
        // 2. Admin (Francisca): primero el hash de la base de datos; si no existe, el del .env
        const hashAdmin = await obtenerHashAdmin();

        if (hashAdmin) {
            const coincide = await bcrypt.compare(password, hashAdmin);
            if (coincide) rol = 'admin';
        } else if (ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
            rol = 'admin';
        }
    }

    if (!rol) return null;

    const token = jwt.sign({ rol }, TOKEN_SECRET, { expiresIn: '8h' });
    return { token, rol };
}

/**
 * Verifica un token y devuelve sus datos (o null si es inválido).
 */
function verificarToken(token) {
    try {
        return jwt.verify(token, TOKEN_SECRET);
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
 */
function protegerAdmin(request, response, next) {
    const token = extraerToken(request);
    const datos = token ? verificarToken(token) : null;

    if (!datos) {
        return response.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    request.usuario = datos;
    next();
}

/**
 * Middleware: SOLO deja pasar al superadmin.
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
    protegerSuperadmin,
    cambiarPasswordAdmin
};