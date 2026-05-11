const express = require('express');
const router = express.Router();
const reservasService = require('../services/reservas');
const googleCalendar = require('../services/googleCalendar');

// GET /api/reagendar/verificar?token=xxx
// Verifica el token y devuelve info de la reserva
router.get('/verificar', async (request, response) => {
    try {
        const { token } = request.query;
        
        if (!token) {
            return response.status(400).json({ error: 'Falta el token' });
        }

        const info = await reservasService.obtenerReservaParaReagendar(token);
        
        if (!info) {
            return response.status(404).json({ error: 'Reserva no encontrada' });
        }

        response.json({
            cliente: info.cliente,
            servicio: info.servicio,
            fechaActual: info.fechaInicio,
            puedeReagendar: info.puedeReagendar,
            motivoNoPuede: info.motivoNoPuede,
            horasRestantes: info.horasRestantes,
            duracionServicio: Math.round((info.fechaFin.toDate ? info.fechaFin.toDate() : info.fechaFin) - info.fechaInicio) / 60000
        });

    } catch (error) {
        console.error('Error al verificar token:', error);
        response.status(500).json({ error: 'Error al verificar reserva' });
    }
});

// GET /api/reagendar/disponibilidad?fecha=YYYY-MM-DD
// Reutiliza la lógica de disponibilidad (consulta Google Calendar)
router.get('/disponibilidad', async (request, response) => {
    try {
        const { fecha, token } = request.query;
        if (!fecha) {
            return response.status(400).json({ error: 'Falta la fecha' });
        }

        const fechaObj = new Date(fecha);
        const eventos = await googleCalendar.listarEventosDelDia(fechaObj);

        // Si nos pasaron un token, buscamos su calendarEventId para excluirlo
        let eventoExcluir = null;
        if (token) {
            const reserva = await reservasService.obtenerReservaPorToken(token);
            if (reserva) {
                eventoExcluir = reserva.calendarEventId;
            }
        }

        const ocupados = eventos
            .filter(evento => evento.id !== eventoExcluir)
            .map(evento => ({
                inicio: evento.start.dateTime,
                fin: evento.end.dateTime,
                titulo: evento.summary
            }));

        response.json({ fecha, ocupados });

    } catch (error) {
        console.error('Error al consultar disponibilidad:', error);
        response.status(500).json({ error: 'No se pudo consultar disponibilidad' });
    }
});

// POST /api/reagendar
// Reagendar la reserva
router.post('/', async (request, response) => {
    try {
        const { token, nuevaFechaInicio, nuevaFechaFin } = request.body;

        if (!token || !nuevaFechaInicio || !nuevaFechaFin) {
            return response.status(400).json({ error: 'Faltan datos' });
        }

        const reservaAntes = await reservasService.obtenerReservaPorToken(token);
        const fechaAnterior = reservaAntes.fechaInicio.toDate ? reservaAntes.fechaInicio.toDate() : reservaAntes.fechaInicio;

        const reservaActualizada = await reservasService.reagendarReserva(
            token,
            nuevaFechaInicio,
            nuevaFechaFin
        );

        // Enviar emails (no bloqueante)
        try {
            const email = require('../services/email');
            await Promise.all([
                email.enviarEmailReagendamientoClienta({
                    cliente: reservaAntes.cliente,
                    email: reservaAntes.email,
                    servicio: reservaAntes.servicio,
                    nuevaFechaInicio: nuevaFechaInicio
                }),
                email.enviarEmailReagendamientoFrancisca({
                    cliente: reservaAntes.cliente,
                    servicio: reservaAntes.servicio,
                    fechaAnterior: fechaAnterior,
                    nuevaFechaInicio: nuevaFechaInicio
                })
            ]);
            console.log('✅ Emails de reagendamiento enviados');
        } catch (errorEmail) {
            console.error('⚠️ Error al enviar emails de reagendamiento:', errorEmail.message);
        }

        response.json({
            mensaje: 'Reserva reagendada exitosamente',
            nuevaFechaInicio: reservaActualizada.fechaInicio,
            nuevaFechaFin: reservaActualizada.fechaFin
        });

    } catch (error) {
        console.error('Error al reagendar:', error);
        // Devolvemos el error específico al frontend
        response.status(400).json({ error: error.message });
    }
});

module.exports = router;