const crypto = require('crypto');
const reservasService = require('../services/reservas');

const URL_SITIO = process.env.URL_SITIO || 'http://localhost:5501';
const MONTO_ABONO = 10000;

const email = require('../services/email');

const express = require('express');
const router = express.Router();
const sumup = require('../services/sumup');

// Inicia el pago: crea el checkout y guarda la reserva como pendiente
router.post('/iniciar', async (request, response) => {
    try {
        const datos = request.body;

        const requeridos = ['cliente', 'telefono', 'email', 'servicio', 'inicio', 'fin'];
        for (const campo of requeridos) {
            if (!datos[campo]) {
                return response.status(400).json({ error: `Falta el campo: ${campo}` });
            }
        }

        // Referencia única para este intento de reserva
        const referencia = 'reserva-' + crypto.randomBytes(8).toString('hex');

        // Crea el checkout en SumUp
        const checkout = await sumup.crearCheckout({
            monto: MONTO_ABONO,
            referencia: referencia,
            descripcion: `Abono reserva - ${datos.servicio}`,
            redirectUrl: `${URL_SITIO}/pago-exitoso.html?ref=${referencia}`
        });

        // Guarda la reserva como pendiente (todavía NO se crea el evento)
        await reservasService.guardarReservaPendiente(referencia, datos, checkout.id);

        response.json({
            url_pago: checkout.hosted_checkout_url,
            referencia: referencia
        });

    } catch (error) {
        console.error('Error al iniciar pago:', error);
        response.status(500).json({ error: 'No se pudo iniciar el pago' });
    }
});

// Verifica el pago y, si está pagado, crea la reserva real
router.get('/confirmar', async (request, response) => {
    try {
        const referencia = request.query.ref;
        if (!referencia) return response.status(400).json({ error: 'Falta la referencia' });

        const pendiente = await reservasService.obtenerReservaPendiente(referencia);
        if (!pendiente) return response.status(404).json({ error: 'Reserva no encontrada' });

        // Si ya se procesó antes, devolvemos confirmada (evita duplicar al recargar)
        if (pendiente.estado === 'procesada') {
            return response.json({ estado: 'confirmada', reserva: pendiente });
        }

        // Consultamos el estado del pago en SumUp
        const checkout = await sumup.obtenerCheckout(pendiente.checkoutId);

        if (checkout.status !== 'PAID') {
            // Todavía no pagó (o falló): NO creamos la reserva
            return response.json({ estado: 'no_pagado', detalle: checkout.status });
        }

        // PAGADO → creamos la reserva de verdad (tu flujo de siempre)
        const datos = {
            cliente: pendiente.cliente,
            telefono: pendiente.telefono,
            email: pendiente.email,
            servicio: pendiente.servicio,
            notas: pendiente.notas || '',
            inicio: pendiente.inicio,
            fin: pendiente.fin
        };

        const resultado = await reservasService.crearReservaCompleta(datos);

        const reservaConToken = { ...datos, tokenReagendar: resultado.tokenReagendar };
        try {
            await Promise.all([
                email.enviarEmailClienta(reservaConToken),
                email.enviarEmailFrancisca(reservaConToken)
            ]);
        } catch (errorEmail) {
            console.error('Error al enviar emails:', errorEmail.message);
        }

        await reservasService.marcarPendienteProcesada(referencia);

        response.json({ estado: 'confirmada', reserva: datos });

    } catch (error) {
        console.error('Error al confirmar pago:', error);
        response.status(500).json({ error: 'No se pudo confirmar el pago' });
    }
});

module.exports = router;