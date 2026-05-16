// SERVICIO DE AUTENTICACIÓN ADMIN \\

const jwt = require('jsonwebtoken');
require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

/**
 * Verifica la contraseña y genera un token si es correcta.
 * @param {string} password - Contraseña ingresada
 * @returns {string|null} - Token JWT si es correcta, null si no
 */
function login(password) {
    if (password !== ADMIN_PASSWORD) {
        return null;
    }

    // Generar token que expira en 8 horas
    const token = jwt.sign(
        { rol: 'admin' },        // datos dentro del token
        TOKEN_SECRET,            // clave para firmarlo
        { expiresIn: '8h' }      // expira en 8 horas
    );

    return token;
}

/**
 * Verifica si un token es válido.
 * @param {string} token - Token a verificar
 * @returns {boolean} - true si es válido
 */
function verificarToken(token) {
    try {
        jwt.verify(token, TOKEN_SECRET);
        return true;
    } catch (error) {
        // Si el token es inválido o expiró, jwt.verify lanza error
        return false;
    }
}

/**
 * Middleware para proteger rutas admin.
 * Se usa así: router.get('/ruta', protegerAdmin, (req, res) => {...})
 */
function protegerAdmin(request, response, next) {
    // El token viene en el header Authorization: "Bearer xxxxx"
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.split(' ')[1];

    if (!verificarToken(token)) {
        return response.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    // Token válido, dejar continuar
    next();
}

module.exports = {
    login,
    verificarToken,
    protegerAdmin
};