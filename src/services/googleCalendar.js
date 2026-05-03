// SERVICIO DE GOOGLE CALENDAR \\

const { google } = require('googleapis');
require('dotenv').config();

// AUTENTICACION \\

const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/calendar']
});

const calendar = google.calendar({ version: 'v3', auth });
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// FUNCIONES \\

/** 
 * Crea un evento en el calendario de Francisca.
 * @param {Object} reserva - Datos de la reserva
 * @returns {Object} - El evento creado
*/

async function crearEvento(reserva) {
    const evento = {
        summary: `${reserva.servicio} - ${reserva.cliente}`,
        description: `
Reserva confirmada
Cliente: ${reserva.cliente}
Teléfono: ${reserva.telefono}
Email: ${reserva.email}
Servicio: ${reserva.servicio}
Notas: ${reserva.notas || 'Sin notas'}
        `.trim(),
        start: {
            dateTime: reserva.inicio,
            timeZone: 'America/Santiago'
        },
        end: {
            dateTime: reserva.fin,
            timeZone: 'America/Santiago'
        }
    };

    const response = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: evento
    });

    return response.data;
}

/**
 * Lista los eventos de un día específico.
 * Sirve para saber qué horarios ya están ocupados.
 * @param {Date} fecha - Fecha a consultar
 * @returns {Array} - Lista de eventos
 */
async function listarEventosDelDia(fecha) {
    const inicioDelDia = new Date(fecha);
    inicioDelDia.setHours(0, 0, 0, 0);

    const finDelDia = new Date(fecha);
    finDelDia.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: inicioDelDia.toISOString(),
        timeMax: finDelDia.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
    });

    return response.data.items;
}

module.exports = {
    crearEvento,
    listarEventosDelDia
};
