// SERVICIO DE HORARIOS \\

const db = require('./firebase');

const DOC = db.collection('config').doc('horarios');

// Horario por defecto (se usa solo si Francisca todavía no guardó nada)
const HORARIO_DEFECTO = {
    semana: {
        '0': [],                                          // domingo cerrado
        '1': ['09:00', '11:00', '14:00', '16:00', '18:00'],
        '2': ['09:00', '11:00', '14:00', '16:00', '18:00'],
        '3': ['09:00', '11:00', '14:00', '16:00', '18:00'],
        '4': ['09:00', '11:00', '14:00', '16:00', '18:00'],
        '5': ['09:00', '11:00', '14:00', '16:00', '18:00'],
        '6': ['09:00', '11:00', '15:00']
    },
    bloqueos: []
};

async function obtenerHorarios() {
    const doc = await DOC.get();
    if (!doc.exists) return HORARIO_DEFECTO;
    const data = doc.data();
    return {
        semana: data.semana || HORARIO_DEFECTO.semana,
        bloqueos: data.bloqueos || []
    };
}

async function guardarHorarios(config) {
    const update = {};
    if (config.semana) update.semana = config.semana;
    if (config.bloqueos !== undefined) update.bloqueos = config.bloqueos;
    await DOC.set(update, { merge: true });
}

module.exports = { obtenerHorarios, guardarHorarios };