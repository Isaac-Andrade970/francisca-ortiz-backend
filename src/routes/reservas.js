// RUTAS DE RESERVAS \\

const express = require('express');
const router = express.Router();
const googleCalendar = require('../services/googleCalendar');
const reservasService = require('../services/reservas');
const email = require('../services/email');

// RUTA: GET /api/reservas/disponibilidad \\

router.get('/disponibilidad', async (request, response) => {
    try {
        const fechaTexto = request.query.fecha;

        if (!fechaTexto) {
            return response.status(400).json({
                error: 'Falta el parámetro "fecha"'
            });
        }

        const fecha = new Date(fechaTexto);

        if (isNaN(fecha.getTime())) {
            return response.status(400).json({
                error: 'Formato de fecha inválido. Usa YYYY-MM-DD.'
            });
        }

        const eventos = await googleCalendar.listarEventosDelDia(fecha);

        const horariosOcupados = eventos.map(evento => ({
            inicio: evento.start.dateTime,
            fin: evento.end.dateTime,
            titulo: evento.summary
        }));

        response.json({
            fecha: fechaTexto,
            ocupados: horariosOcupados
        });

    } catch (error) {
        console.error('Error al consultar disponibilidad:', error);
        response.status(500).json({
            error: 'No se pudo consultar la disponibilidad'
        });
    }
});

// RUTA: POST /api/reservas \\

router.post('/', async (request, response) => {
    try {
        const reserva = request.body;

        const camposRequeridos = ['cliente', 'telefono', 'email', 'servicio', 'inicio', 'fin'];
        for (const campo of camposRequeridos) {
            if (!reserva[campo]) {
                return response.status(400).json({
                    error: `Falta el campo: ${campo}`
                });
            }
        }

        const resultado = await reservasService.crearReservaCompleta(reserva);

        const reservaConToken = {
            ...reserva,
            tokenReagendar: resultado.tokenReagendar
        };

        try {
            await Promise.all([
                email.enviarEmailClienta(reservaConToken),
                email.enviarEmailFrancisca(reservaConToken)
            ]);
            console.log('✅ Emails de confirmación enviados');
        } catch (errorEmail) {
            console.error('⚠️ Error al enviar emails:', errorEmail.message);
        // No interrumpimos el flujo, la reserva ya está en el calendar
        }   

        response.status(201).json({
            mensaje: 'Reserva creada exitosamente',
            evento: {
                id: resultado.eventoId,
                inicio: resultado.fechaInicio,
                fin: resultado.fechaFin
            }
        });

    } catch (error) {
        console.error('Error al crear reserva:', error);
        response.status(500).json({
            error: 'No se pudo crear la reserva'
        });
    }
});

module.exports = router;
