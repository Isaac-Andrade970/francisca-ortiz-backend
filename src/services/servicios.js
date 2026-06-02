// SERVICIO DE GESTIÓN DE SERVICIOS DEL NEGOCIO \\

const db = require('./firebase');

const COLECCION = 'servicios';

/**
 * Lista solo los servicios ACTIVOS, ordenados.
 * Esto es lo que verá el público en la web.
 */
async function listarServiciosActivos() {
    const snapshot = await db.collection(COLECCION)
        .where('activo', '==', true)
        .get();

    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.orden - b.orden);
}

/**
 * Lista TODOS los servicios (activos e inactivos).
 * Esto lo usa el panel admin.
 */
async function listarTodos() {
    const snapshot = await db.collection(COLECCION)
        .orderBy('orden', 'asc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Crea un nuevo servicio.
 */
async function crearServicio(datos) {
    const nuevo = {
        nombre: datos.nombre,
        descripcion: datos.descripcion || '',
        precio: Number(datos.precio),
        duracion: Number(datos.duracion),       // en minutos
        categoria: datos.categoria || 'peluqueria', // peluqueria | manicure
        activo: datos.activo !== undefined ? datos.activo : true,
        orden: datos.orden !== undefined ? Number(datos.orden) : 99,
        fechaCreacion: new Date()
    };

    const referencia = await db.collection(COLECCION).add(nuevo);
    return { id: referencia.id, ...nuevo };
}

/**
 * Actualiza un servicio existente. Solo cambia los campos que llegan.
 */
async function actualizarServicio(id, cambios) {
    const permitidos = ['nombre', 'descripcion', 'precio', 'duracion', 'categoria', 'activo', 'orden'];
    const actualizacion = {};

    for (const campo of permitidos) {
        if (cambios[campo] !== undefined) {
            // precio, duracion y orden se guardan como número
            if (['precio', 'duracion', 'orden'].includes(campo)) {
                actualizacion[campo] = Number(cambios[campo]);
            } else {
                actualizacion[campo] = cambios[campo];
            }
        }
    }

    await db.collection(COLECCION).doc(id).update(actualizacion);
    return { id, ...actualizacion };
}

/**
 * "Apaga" un servicio sin borrarlo (soft delete).
 * Es el camino seguro: lo saca de la web pero queda el historial.
 */
async function desactivarServicio(id) {
    await db.collection(COLECCION).doc(id).update({ activo: false });
    return { id, activo: false };
}

/**
 * Borra un servicio PERMANENTEMENTE. Operación peligrosa: solo superadmin.
 */
async function eliminarServicioPermanente(id) {
    await db.collection(COLECCION).doc(id).delete();
    return { id, eliminado: true };
}

module.exports = {
    listarServiciosActivos,
    listarTodos,
    crearServicio,
    actualizarServicio,
    desactivarServicio,
    eliminarServicioPermanente
};