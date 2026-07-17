const crypto = require('crypto');
const reservasService = require('../services/reservas');

const URL_SITIO = process.env.URL_SITIO || 'http://localhost:5501';
const URL_BACKEND = process.env.URL_BACKEND || 'http://localhost:3000';
const MONTO_ABONO = 10000;

const email = require('../services/email');
const googleCalendar = require('../services/googleCalendar');

const express = require('express');
const router = express.Router();
const sumup = require('../services/sumup');

/**
 * Procesa una reserva pendiente: si el pago está PAGADO, crea la reserva real,
 * manda los correos y marca la pendiente como procesada. Es IDEMPOTENTE.
 * La usan tanto /confirmar (cliente vuelve) como /webhook (aviso de SumUp).
 */
async function procesarReservaPendiente(referencia) {
    // Reclamo atómico: si /confirmar y /webhook llegan casi al mismo tiempo,
    // solo uno de los dos logra pasar de 'esperando_pago' a 'procesando'.
    const reclamo = await reservasService.reclamarReservaPendiente(referencia);

    if (reclamo.estado === 'no_encontrada') return { estado: 'no_encontrada' };

    // Ya se procesó antes (o se está procesando ahora mismo en otra llamada): no duplicar
    if (reclamo.estado === 'procesada') {
        return { estado: 'confirmada', reserva: reclamo.datos };
    }
    if (reclamo.estado === 'procesando') {
        return { estado: 'procesando' };
    }

    const pendiente = reclamo.datos;

    try {
        // Consultamos el estado real del pago en SumUp
        const checkout = await sumup.obtenerCheckout(pendiente.checkoutId);
        if (checkout.status !== 'PAID') {
            await reservasService.revertirReservaPendiente(referencia);
            return { estado: 'no_pagado', detalle: checkout.status };
        }

        // PAGADO → creamos la reserva de verdad
        const datos = {
            cliente: pendiente.cliente,
            telefono: pendiente.telefono,
            email: pendiente.email,
            servicios: pendiente.servicios,
            notas: pendiente.notas || '',
            inicio: pendiente.inicio,
            fin: pendiente.fin
        };

        const resultado = await reservasService.crearReservaCompleta(datos);

        const reservaConToken = { ...datos, servicio: datos.servicios.join(', '), tokenReagendar: resultado.tokenReagendar };
        const [resultadoClienta, resultadoFrancisca] = await Promise.allSettled([
            email.enviarEmailClienta(reservaConToken),
            email.enviarEmailFrancisca(reservaConToken)
        ]);
        if (resultadoClienta.status === 'rejected') {
            console.error('Error al enviar email a la clienta:', resultadoClienta.reason.message);
        }
        if (resultadoFrancisca.status === 'rejected') {
            console.error('Error al enviar email a Francisca:', resultadoFrancisca.reason.message);
        }

        await reservasService.marcarPendienteProcesada(referencia);

        return { estado: 'confirmada', reserva: datos };
    } catch (error) {
        // Si falló creando la reserva, liberamos el candado para poder reintentar después
        await reservasService.revertirReservaPendiente(referencia);
        throw error;
    }
}

// Inicia el pago: crea el checkout y guarda la reserva como pendiente
router.post('/iniciar', async (request, response) => {
    try {
        const datos = request.body;

        const requeridos = ['cliente', 'telefono', 'email', 'servicios', 'inicio', 'fin'];
        for (const campo of requeridos) {
            if (!datos[campo]) {
                return response.status(400).json({ error: `Falta el campo: ${campo}` });
            }
        }

        if (!Array.isArray(datos.servicios) || datos.servicios.length === 0) {
            return response.status(400).json({ error: 'Debes elegir al menos un servicio' });
        }

        const conflicto = await googleCalendar.hayConflicto(datos.inicio, datos.fin);
        if (conflicto) {
            return response.status(409).json({ error: 'Ese horario ya no está disponible. Por favor elige otro.' });
        }

        const referencia = 'reserva-' + crypto.randomBytes(8).toString('hex');

        const checkout = await sumup.crearCheckout({
            monto: MONTO_ABONO,
            referencia: referencia,
            descripcion: `Abono reserva - ${datos.servicios.join(', ')}`,
            redirectUrl: `${URL_SITIO}/pago-exitoso.html?ref=${referencia}`,
            returnUrl: `${URL_BACKEND}/api/pagos/webhook`
        });

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

// Verifica el pago cuando el cliente vuelve a pago-exitoso.html
router.get('/confirmar', async (request, response) => {
    try {
        const referencia = request.query.ref;
        if (!referencia) return response.status(400).json({ error: 'Falta la referencia' });

        const resultado = await procesarReservaPendiente(referencia);

        if (resultado.estado === 'no_encontrada') {
            return response.status(404).json({ error: 'Reserva no encontrada' });
        }

        response.json(resultado); // 'confirmada' o 'no_pagado'
    } catch (error) {
        console.error('Error al confirmar pago:', error);
        response.status(500).json({ error: 'No se pudo confirmar el pago' });
    }
});

// Webhook de SumUp: avisa cuando cambia el estado de un checkout.
// Es PÚBLICO (SumUp lo llama). Siempre respondemos 200 para evitar reintentos en loop.
router.post('/webhook', async (request, response) => {
    try {
        const body = request.body || {};
        const checkoutId = body.id || body.checkout_id || (body.payload && body.payload.id);

        if (!checkoutId) {
            console.warn('[WEBHOOK SumUp] Payload sin checkout id:', JSON.stringify(body));
            return response.status(200).json({ recibido: true });
        }

        // Consultamos el checkout real (autenticado) → referencia + estado
        const checkout = await sumup.obtenerCheckout(checkoutId);
        const referencia = checkout.checkout_reference;

        if (!referencia) {
            console.warn('[WEBHOOK SumUp] Checkout sin checkout_reference:', checkoutId);
            return response.status(200).json({ recibido: true });
        }

        const resultado = await procesarReservaPendiente(referencia);
        console.log(`[WEBHOOK SumUp] ${referencia} → ${resultado.estado}`);

        return response.status(200).json({ recibido: true });
    } catch (error) {
        console.error('[WEBHOOK SumUp] Error:', error.message);
        // Aun con error devolvemos 200; el /confirmar sigue como respaldo
        return response.status(200).json({ recibido: true });
    }
});

module.exports = router;