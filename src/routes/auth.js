const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const { protegerSuperadmin } = require('../services/auth');

// POST /api/auth/login
router.post('/login', async (request, response) => {
    const { password } = request.body;

    if (!password) {
        return response.status(400).json({ error: 'Falta la contraseña' });
    }

    try {
        const resultado = await authService.login(password);

        if (!resultado) {
            return response.status(401).json({ error: 'Contraseña incorrecta' });
        }

        response.json({
            mensaje: 'Login exitoso',
            token: resultado.token,
            rol: resultado.rol
        });
    } catch (error) {
        console.error('Error en login:', error);
        response.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// POST /api/auth/cambiar-password-admin  (SOLO superadmin)
router.post('/cambiar-password-admin', protegerSuperadmin, async (request, response) => {
    const { nuevaPassword } = request.body;

    if (!nuevaPassword || nuevaPassword.length < 6) {
        return response.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    try {
        await authService.cambiarPasswordAdmin(nuevaPassword);
        response.json({ mensaje: 'Contraseña de Francisca actualizada correctamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña admin:', error);
        response.status(500).json({ error: 'No se pudo cambiar la contraseña' });
    }
});

module.exports = router;