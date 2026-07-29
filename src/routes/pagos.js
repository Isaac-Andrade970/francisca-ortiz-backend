const crypto = require('crypto');
const reservasService = require('../services/reservas');

const URL_SITIO = process.env.URL_SITIO || 'http://localhost:5501';
const URL_BACKEND = process.env.URL_BACKEND || 'http://localhost:3000';
const MONTO_ABONO = 10000;

const email = require('../services/email');
const googleCalendar = require('../services/googleCalendar');

const express = require('express');
const router = express.Router();
const mercadopago = require('../services/mercadopago');

/**
 * Procesa un pago de Mercado Pago: si está aprobado, crea la reserva real,
 * manda los correos y marca la pendiente como procesada. Es IDEMPOTENTE.
 * La usan tanto /confirmar (cliente vuelve) como /webhook (aviso de Mercado Pago).
 * Recibe el ID del PAGO (no la referencia): primero se consulta el pago,
 * y de ahí se saca la referencia (external_reference) para ubicar la reserva pendiente.
 */
async function procesarReservaPendiente(paymentId) {
    const pago = await mercadopago.obtenerPago(paymentId);
    const referencia = pago.external_reference;

    if (!referencia) return { estado: 'sin_referencia' };

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
        if (pago.status !== 'approved') {
            await reservasService.revertirReservaPendiente(referencia);
            return { estado: 'no_pagado', detalle: pago.status };
        }

        // APROBADO → creamos la reserva de verdad
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

// Inicia el pago: crea la preferencia y guarda la reserva como pendiente
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

        if (datos.servicios.length > 3) {
            return response.status(400).json({ error: 'Puedes elegir hasta 3 servicios por reserva' });
        }

        const conflicto = await googleCalendar.hayConflicto(datos.inicio, datos.fin);
        if (conflicto) {
            return response.status(409).json({ error: 'Ese horario ya no está disponible. Por favor elige otro.' });
        }

        const referencia = 'reserva-' + crypto.randomBytes(8).toString('hex');

        const checkout = await mercadopago.crearCheckout({
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
        const paymentId = request.query.payment_id;
        if (!paymentId) return response.status(400).json({ error: 'Falta el ID del pago' });

        const resultado = await procesarReservaPendiente(paymentId);

        if (resultado.estado === 'no_encontrada' || resultado.estado === 'sin_referencia') {
            return response.status(404).json({ error: 'Reserva no encontrada' });
        }

        response.json(resultado); // 'confirmada' o 'no_pagado'
    } catch (error) {
        console.error('Error al confirmar pago:', error);
        response.status(500).json({ error: 'No se pudo confirmar el pago' });
    }
});

// Webhook de Mercado Pago: avisa cuando cambia el estado de un pago.
// Es PÚBLICO (Mercado Pago lo llama). Se verifica la firma antes de hacer nada.
router.post('/webhook', async (request, response) => {
    try {
        const body = request.body || {};
        const tipo = body.type || request.query.type;

        if (tipo !== 'payment') {
            return response.status(200).json({ recibido: true });
        }

        const dataId = (body.data && body.data.id) || request.query['data.id'];
        if (!dataId) {
            console.warn('[WEBHOOK Mercado Pago] Payload sin data.id:', JSON.stringify(body));
            return response.status(200).json({ recibido: true });
        }

        const firmaValida = mercadopago.verificarFirma({
            xSignature: request.headers['x-signature'],
            xRequestId: request.headers['x-request-id'],
            dataId: String(dataId)
        });

        if (!firmaValida) {
            console.warn('[WEBHOOK Mercado Pago] Firma inválida, se rechaza');
            return response.status(401).json({ error: 'Firma inválida' });
        }

        const resultado = await procesarReservaPendiente(dataId);
        console.log(`[WEBHOOK Mercado Pago] pago ${dataId} → ${resultado.estado}`);

        return response.status(200).json({ recibido: true });
    } catch (error) {
        console.error('[WEBHOOK Mercado Pago] Error:', error.message);
        // Aun con error devolvemos 200; el /confirmar sigue como respaldo
        return response.status(200).json({ recibido: true });
    }
});

module.exports = router;
