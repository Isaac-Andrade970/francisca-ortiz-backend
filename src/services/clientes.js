// SERVICIO DE CLIENTAS (historial + observaciones para el panel admin) \\

const db = require('./firebase');

function normalizarEmail(email) {
    return String(email || '').trim().toLowerCase();
}

/**
 * Agrupa todas las reservas por email y arma un resumen por clienta.
 * No hay colección "clientes" separada para nombre/teléfono: se derivan
 * de la reserva más reciente de cada una, para no duplicar datos que
 * puedan desincronizarse.
 */
async function listarClientesUnicos() {
    const snapshot = await db.collection('reservas').get();

    const porEmail = new Map();

    snapshot.forEach((doc) => {
        const datos = doc.data();
        const email = normalizarEmail(datos.email);
        if (!email) return;

        const fechaInicio = datos.fechaInicio.toDate ? datos.fechaInicio.toDate() : datos.fechaInicio;

        const existente = porEmail.get(email);
        if (!existente || fechaInicio > existente.ultimaReserva) {
            porEmail.set(email, {
                email,
                cliente: datos.cliente,
                telefono: datos.telefono,
                totalReservas: (existente ? existente.totalReservas : 0) + 1,
                ultimaReserva: fechaInicio
            });
        } else {
            existente.totalReservas += 1;
        }
    });

    return Array.from(porEmail.values()).sort((a, b) => b.ultimaReserva - a.ultimaReserva);
}

/**
 * Historial de reservas de una clienta puntual, más reciente primero.
 */
async function obtenerHistorialCliente(email) {
    const emailNormalizado = normalizarEmail(email);

    const snapshot = await db.collection('reservas')
        .where('email', '==', emailNormalizado)
        .get();

    return snapshot.docs
        .map((doc) => {
            const datos = doc.data();
            const fechaInicio = datos.fechaInicio.toDate ? datos.fechaInicio.toDate() : datos.fechaInicio;
            return {
                id: doc.id,
                servicios: datos.servicios || [],
                fecha: fechaInicio,
                estado: datos.estado,
                notas: datos.notas || ''
            };
        })
        .sort((a, b) => b.fecha - a.fecha);
}

/**
 * Nota persistente por clienta (una sola, se va sobreescribiendo).
 */
async function obtenerObservaciones(email) {
    const doc = await db.collection('clientes').doc(normalizarEmail(email)).get();
    if (!doc.exists) return '';
    return doc.data().observaciones || '';
}

async function guardarObservaciones(email, observaciones) {
    await db.collection('clientes').doc(normalizarEmail(email)).set({
        observaciones: observaciones || '',
        fechaActualizacion: new Date()
    }, { merge: true });
}

module.exports = {
    listarClientesUnicos,
    obtenerHistorialCliente,
    obtenerObservaciones,
    guardarObservaciones
};
