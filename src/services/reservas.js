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

/**
 * Reagendar una reserva existente.
 * Devuelve la reserva actualizada o lanza error con motivo.
 */
async function reagendarReserva(token, nuevaFechaInicio, nuevaFechaFin) {
    // 1. Buscar la reserva por token
    const reserva = await obtenerReservaPorToken(token);
    
    if (!reserva) {
        throw new Error('Token inválido o reserva no encontrada');
    }

    // 2. Validar que no haya reagendado antes
    if (reserva.reagendamientos >= 1) {
        throw new Error('Esta reserva ya fue reagendada una vez. No se permite reagendar nuevamente.');
    }

    // 3. Validar que falten al menos 48 horas para la cita ACTUAL
    const fechaInicioActual = reserva.fechaInicio.toDate ? reserva.fechaInicio.toDate() : reserva.fechaInicio;
    const ahora = new Date();
    const horasRestantes = (fechaInicioActual - ahora) / (1000 * 60 * 60);

    if (horasRestantes < 48) {
        throw new Error('Solo puedes reagendar con al menos 48 horas de anticipación.');
    }

    // 4. Validar que la nueva fecha sea futura
    const nuevaInicio = new Date(nuevaFechaInicio);
    if (nuevaInicio < ahora) {
        throw new Error('La nueva fecha debe ser futura.');
    }

    // 5. Actualizar el evento en Google Calendar
    const googleCalendar = require('./googleCalendar');
    await googleCalendar.actualizarEvento(
        reserva.calendarEventId,
        nuevaFechaInicio,
        nuevaFechaFin
    );

    // 6. Actualizar en Firestore
    await db.collection('reservas').doc(reserva.id).update({
        fechaInicio: new Date(nuevaFechaInicio),
        fechaFin: new Date(nuevaFechaFin),
        reagendamientos: reserva.reagendamientos + 1,
        fechaUltimoReagendamiento: new Date()
    });

    return {
        ...reserva,
        fechaInicio: new Date(nuevaFechaInicio),
        fechaFin: new Date(nuevaFechaFin),
        reagendamientos: reserva.reagendamientos + 1
    };
}

/**
 * Obtener reserva por token con información adicional para reagendar
 */
async function obtenerReservaParaReagendar(token) {
    const reserva = await obtenerReservaPorToken(token);
    if (!reserva) return null;

    const fechaInicio = reserva.fechaInicio.toDate ? reserva.fechaInicio.toDate() : reserva.fechaInicio;
    const ahora = new Date();
    const horasRestantes = (fechaInicio - ahora) / (1000 * 60 * 60);

    return {
        ...reserva,
        fechaInicio: fechaInicio,
        puedeReagendar: reserva.reagendamientos < 1 && horasRestantes >= 48,
        motivoNoPuede: reserva.reagendamientos >= 1
            ? 'Ya reagendaste esta reserva una vez'
            : horasRestantes < 48
                ? 'Quedan menos de 48 horas para tu cita'
                : null,
        horasRestantes: Math.floor(horasRestantes)
    };
}

module.exports = {
    crearReservaCompleta,
    obtenerReservaPorToken,
    listarReservasParaResena,
    marcarEmailResenaEnviado,
    reagendarReserva,
    obtenerReservaParaReagendar
};