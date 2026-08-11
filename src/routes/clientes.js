const express = require('express');
const router = express.Router();
const clientesService = require('../services/clientes');
const { protegerAdmin } = require('../services/auth');

// Todo este archivo es interno del panel admin: nada público.

// GET /api/clientes - lista agrupada por email, con resumen de cada clienta
router.get('/', protegerAdmin, async (request, response) => {
    try {
        const clientes = await clientesService.listarClientesUnicos();
        response.json({ clientes });
    } catch (error) {
        console.error('Error al listar clientas:', error);
        response.status(500).json({ error: 'Error al cargar clientas' });
    }
});

// GET /api/clientes/:email - historial completo + observaciones de una clienta
router.get('/:email', protegerAdmin, async (request, response) => {
    try {
        const { email } = request.params;
        const [historial, observaciones] = await Promise.all([
            clientesService.obtenerHistorialCliente(email),
            clientesService.obtenerObservaciones(email)
        ]);
        response.json({ historial, observaciones });
    } catch (error) {
        console.error('Error al obtener clienta:', error);
        response.status(500).json({ error: 'Error al cargar la clienta' });
    }
});

// PUT /api/clientes/:email/observaciones - guarda/actualiza la nota de esa clienta
router.put('/:email/observaciones', protegerAdmin, async (request, response) => {
    try {
        const { email } = request.params;
        await clientesService.guardarObservaciones(email, request.body.observaciones);
        response.json({ mensaje: 'Observaciones guardadas' });
    } catch (error) {
        console.error('Error al guardar observaciones:', error);
        response.status(500).json({ error: 'Error al guardar observaciones' });
    }
});

module.exports = router;
