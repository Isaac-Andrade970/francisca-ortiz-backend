// SERVICIO DE RESEÑAS \\

const db = require('./firebase');

/**
 * Crear una reseña nueva (pendiente de aprobación)
 */
async function crearResena(datos) {
    const docResena = {
        reservaId: datos.reservaId,
        cliente: datos.cliente,
        servicio: datos.servicio,
        calificacion: datos.calificacion,
        comentario: datos.comentario,
        fechaCreacion: new Date(),
        aprobada: false,
        fechaAprobacion: null
    };

    const referencia = await db.collection('resenas').add(docResena);
    return { id: referencia.id, ...docResena };
}

/**
 * Listar reseñas aprobadas (para mostrar al público)
 */
async function listarResenasAprobadas() {
    const snapshot = await db.collection('resenas')
        .where('aprobada', '==', true)
        .orderBy('fechaAprobacion', 'desc')
        .limit(20)
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Obtener reseña por ID (para verificar antes de aprobar)
 */
async function obtenerResena(id) {
    const doc = await db.collection('resenas').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

/**
 * Listar reseñas pendientes de aprobación (para admin)
 */
async function listarResenasPendientes() {
    const snapshot = await db.collection('resenas')
        .where('aprobada', '==', false)
        .orderBy('fechaCreacion', 'desc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Aprobar una reseña (admin)
 */
async function aprobarResena(id) {
    await db.collection('resenas').doc(id).update({
        aprobada: true,
        fechaAprobacion: new Date()
    });
}

/**
 * Rechazar (eliminar) una reseña
 */
async function rechazarResena(id) {
    await db.collection('resenas').doc(id).delete();
}

module.exports = {
    crearResena,
    listarResenasAprobadas,
    obtenerResena,
    listarResenasPendientes,
    aprobarResena,
    rechazarResena
};