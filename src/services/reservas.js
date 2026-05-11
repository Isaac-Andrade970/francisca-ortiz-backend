// SERVICIO DE RESERVAS \\

const { calendar } = require('googleapis/build/src/apis/calendar');
const db = require('./firebase');
const googleCalendar = require('./googleCalendar');
const crypto = require('crypto');

/**
 * Genera un Token único alfanumerico de 20 caracteres
 */
function generarToken(){
    return crypto.randomBytes(15).toString('hex');
}

/**
 * Crear una reserva completa: en Firestore + Google Calendar
 */
async function crearReservaCompleta(reserva) {
    const evento = await googleCalendar.crearEvento(reserva);

    const tokenReagendar = generarToken();

    const docReserva = {
        cliente: reserva.cliente,
        telefono: reserva.telefono,
        email: reserva.email,
        servicio: reserva.servicio,
        notas: reserva.notas || '',
        fechaInicio: new Date(reserva.inicio),
        fechaFin: new Date(reserva.fin),
        estado: 'pendiente', // pendiente | confirmada | completada | cancelada
        calendarEventId: evento.id,
        reagendamientos: 0,
        tokenReagendar: tokenReagendar,
        emailResenaEnviado: false,
        fechaCreacion: new Date()
    };

    const referencia = await db.collection('reservas').add(docReserva);

    return {
        eventoId: evento.id,
        reservaId: referencia.id,
        tokenReagendar: tokenReagendar,
        ...docReserva
    };
}

/**
 * Obtener una reserva por su token de reagendar
 */
async function obtenerReservaPorToken(token) {
    const snapshot = await db.collection('reservas')
        .where('tokenReagendar', '==', token)
        .limit(1)
        .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
}

/**
 * Listar reservas completadas que NO tienen email de reseña enviado
 */
async function listarReservasParaResena() {
    const ahora = new Date();
    
    const snapshot = await db.collection('reservas')
        .where('estado', '==', 'completada')
        .where('emailResenaEnviado', '==', false)
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Marcar que ya se envió email de reseña a una reserva
 */
async function marcarEmailResenaEnviado(reservaId) {
    await db.collection('reservas').doc(reservaId).update({
        emailResenaEnviado: true
    });
}

module.exports = {
    crearReservaCompleta,
    obtenerReservaPorToken,
    listarReservasParaResena,
    marcarEmailResenaEnviado
};