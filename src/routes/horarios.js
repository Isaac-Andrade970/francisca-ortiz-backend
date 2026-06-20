const express = require('express');
const router = express.Router();
const horariosService = require('../services/horarios');
const { protegerAdmin } = require('../services/auth');

// GET público: la página de reservas lee el horario
router.get('/', async (request, response) => {
    try {
        const horarios = await horariosService.obtenerHorarios();
        response.json(horarios);
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        response.status(500).json({ error: 'No se pudieron obtener los horarios' });
    }
});

// PUT protegido: el admin guarda cambios
router.put('/', protegerAdmin, async (request, response) => {
    try {
        const { semana, bloqueos } = request.body;
        if (!semana || typeof semana !== 'object') {
            return response.status(400).json({ error: 'Falta el horario semanal' });
        }
        await horariosService.guardarHorarios({ semana, bloqueos });
        response.json({ mensaje: 'Horarios actualizados' });
    } catch (error) {
        console.error('Error al guardar horarios:', error);
        response.status(500).json({ error: 'No se pudieron guardar los horarios' });
    }
});

module.exports = router;