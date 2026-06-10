// SERVICIO DE PAGOS SUMUP \\

require('dotenv').config();

const SUMUP_API = 'https://api.sumup.com/v0.1';

// Crea un checkout y devuelve los datos (incluye hosted_checkout_url)
async function crearCheckout({ monto, referencia, descripcion, redirectUrl }) {
    const respuesta = await fetch(`${SUMUP_API}/checkouts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.SUMUP_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            checkout_reference: referencia,
            amount: monto,
            currency: 'CLP',
            merchant_code: process.env.SUMUP_MERCHANT_CODE,
            description: descripcion,
            hosted_checkout: { enabled: true },
            redirect_url: redirectUrl
        })
    });

    if (!respuesta.ok) {
        const detalle = await respuesta.text();
        throw new Error('Error al crear checkout SumUp: ' + detalle);
    }

    return respuesta.json();
}

// Consulta el estado de un checkout (para verificar si se pagó)
async function obtenerCheckout(checkoutId) {
    const respuesta = await fetch(`${SUMUP_API}/checkouts/${checkoutId}`, {
        headers: { 'Authorization': `Bearer ${process.env.SUMUP_API_KEY}` }
    });

    if (!respuesta.ok) throw new Error('Error al obtener checkout SumUp');
    return respuesta.json();
}

module.exports = { crearCheckout, obtenerCheckout };