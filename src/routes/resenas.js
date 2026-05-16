const express = require('express');
const router = express.Router();
const resenasService = require('../services/resenas');
const reservasService = require('../services/reservas');
const { protegerAdmin } = require('../services/auth');

// GET /api/resenas - Listar reseñas aprobadas (pública)
router.get('/', async (request, response) => {
    try {
        const resenas = await resenasService.listarResenasAprobadas();
        response.json({ resenas });
    } catch (error) {
        console.error('Error al listar reseñas:', error);
        response.status(500).json({ error: 'No se pudieron obtener las reseñas' });
    }
});

// GET /api/resenas/verificar?token=xxx - Verificar token y obtener datos de reserva
router.get('/verificar', async (request, response) => {
    try {
        const { token } = request.query;
        
        if (!token) {
            return response.status(400).json({ error: 'Falta el token' });
        }

        const reserva = await reservasService.obtenerReservaPorToken(token);
        
        if (!reserva) {
            return response.status(404).json({ error: 'Token inválido' });
        }

        response.json({
            cliente: reserva.cliente,
            servicio: reserva.servicio,
            reservaId: reserva.id
        });

    } catch (error) {
        console.error('Error al verificar token:', error);
        response.status(500).json({ error: 'Error al verificar' });
    }
});

// POST /api/resenas - Crear una reseña nueva
router.post('/', async (request, response) => {
    try {
        const { token, calificacion, comentario } = request.body;

        if (!token || !calificacion || !comentario) {
            return response.status(400).json({ error: 'Faltan datos' });
        }

        if (calificacion < 1 || calificacion > 5) {
            return response.status(400).json({ error: 'Calificación inválida' });
        }

        // Verificar que el token sea válido
        const reserva = await reservasService.obtenerReservaPorToken(token);
        if (!reserva) {
            return response.status(404).json({ error: 'Token inválido' });
        }

        // Crear la reseña
        const resena = await resenasService.crearResena({
            reservaId: reserva.id,
            cliente: reserva.cliente,
            servicio: reserva.servicio,
            calificacion: parseInt(calificacion),
            comentario: comentario.trim()
        });

        response.status(201).json({
            mensaje: 'Reseña enviada, será publicada después de revisión',
            resenaId: resena.id
        });

    } catch (error) {
        console.error('Error al crear reseña:', error);
        response.status(500).json({ error: 'No se pudo enviar la reseña' });
    }
});

// RUTAS ADMIN \\

// GET /api/resenas/admin/pendientes - Listar reseñas pendientes de aprobar
router.get('/admin/pendientes', protegerAdmin, async (request, response) => {
    try {
        const resenas = await resenasService.listarResenasPendientes();
        response.json({ resenas });
    } catch (error) {
        console.error('Error al listar pendientes:', error);
        response.status(500).json({ error: 'Error al cargar reseñas' });
    }
});

// PATCH /api/resenas/admin/:id/aprobar - Aprobar una reseña
router.patch('/admin/:id/aprobar', protegerAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        await resenasService.aprobarResena(id);
        response.json({ mensaje: 'Reseña aprobada' });
    } catch (error) {
        console.error('Error al aprobar:', error);
        response.status(500).json({ error: 'Error al aprobar reseña' });
    }
});

// DELETE /api/resenas/admin/:id - Rechazar (eliminar) una reseña
router.delete('/admin/:id', protegerAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        await resenasService.rechazarResena(id);
        response.json({ mensaje: 'Reseña rechazada' });
    } catch (error) {
        console.error('Error al rechazar:', error);
        response.status(500).json({ error: 'Error al rechazar reseña' });
    }
});

module.exports = router;