const express = require('express');
const router = express.Router();
const authService = require('../services/auth');

// POST /api/auth/login
router.post('/login', (request, response) => {
    const { password } = request.body;

    if (!password) {
        return response.status(400).json({ error: 'Falta la contraseña' });
    }

    const token = authService.login(password);

    if (!token) {
        return response.status(401).json({ error: 'Contraseña incorrecta' });
    }

    response.json({
        mensaje: 'Login exitoso',
        token: token
    });
});

module.exports = router;