// SERVICIO DE PAGOS MERCADO PAGO \\

require('dotenv').config();
const crypto = require('crypto');

const MP_API = 'https://api.mercadopago.com';

// Crea una preferencia de pago y devuelve la URL de checkout (init_point).
// Mismo shape de entrada/salida que tenía sumup.crearCheckout, para no tocar
// a quien la llama.
async function crearCheckout({ monto, referencia, descripcion, redirectUrl, returnUrl }) {
    const respuesta = await fetch(`${MP_API}/checkout/preferences`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: [{
                title: descripcion,
                quantity: 1,
                unit_price: monto,
                currency_id: 'CLP'
            }],
            external_reference: referencia,
            back_urls: {
                success: redirectUrl,
                pending: redirectUrl,
                failure: redirectUrl
            },
            auto_return: 'approved',
            notification_url: returnUrl
        })
    });

    if (!respuesta.ok) {
        const detalle = await respuesta.text();
        throw new Error('Error al crear preferencia Mercado Pago: ' + detalle);
    }

    const data = await respuesta.json();
    return { hosted_checkout_url: data.init_point, id: data.id };
}

// Consulta un pago real por su ID (esto es lo único que dice si se pagó de verdad).
async function obtenerPago(paymentId) {
    const respuesta = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` }
    });

    if (!respuesta.ok) throw new Error('Error al obtener pago Mercado Pago');
    return respuesta.json();
}

// Verifica la firma del webhook (header x-signature: "ts=...,v1=...").
// Evita que cualquiera le pegue a /webhook haciéndose pasar por Mercado Pago.
function verificarFirma({ xSignature, xRequestId, dataId }) {
    if (!xSignature || !dataId) return false;

    let ts;
    let hash;
    xSignature.split(',').forEach((parte) => {
        const [clave, valor] = parte.split('=');
        if (clave && valor) {
            const claveLimpia = clave.trim();
            const valorLimpio = valor.trim();
            if (claveLimpia === 'ts') ts = valorLimpio;
            if (claveLimpia === 'v1') hash = valorLimpio;
        }
    });

    if (!ts || !hash) return false;

    const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId || ''};ts:${ts};`;
    const hashCalculado = crypto
        .createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET)
        .update(manifest)
        .digest('hex');

    const bufferCalculado = Buffer.from(hashCalculado);
    const bufferRecibido = Buffer.from(hash);

    if (bufferCalculado.length !== bufferRecibido.length) return false;
    return crypto.timingSafeEqual(bufferCalculado, bufferRecibido);
}

module.exports = { crearCheckout, obtenerPago, verificarFirma };
