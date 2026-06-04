// SERVICIO DE GESTIÓN DE PRODUCTOS \\

const db = require('./firebase');

const COLECCION = 'productos';

async function listarActivos() {
    const snapshot = await db.collection(COLECCION)
        .where('activo', '==', true)
        .get();

    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.orden - b.orden);
}

async function listarTodos() {
    const snapshot = await db.collection(COLECCION).get();

    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.orden - b.orden);
}

async function crearProducto(datos) {
    const nuevo = {
        nombre: datos.nombre,
        marca: datos.marca || 'Cloe Professional',     // Cloe Professional | Rouvé Professional | Men's Work
        categoria: datos.categoria || 'cloe',           // cloe | rouve | mens
        precio: Number(datos.precio),
        descripcion: datos.descripcion || '',
        imagen: datos.imagen || '',                      // URL de Cloudinary o ruta local
        destacado: datos.destacado !== undefined ? datos.destacado : false,
        activo: datos.activo !== undefined ? datos.activo : true,
        orden: datos.orden !== undefined ? Number(datos.orden) : 99,
        fechaCreacion: new Date()
    };

    const referencia = await db.collection(COLECCION).add(nuevo);
    return { id: referencia.id, ...nuevo };
}

async function actualizarProducto(id, cambios) {
    const permitidos = ['nombre', 'marca', 'categoria', 'precio', 'descripcion', 'imagen', 'destacado', 'activo', 'orden'];
    const actualizacion = {};

    for (const campo of permitidos) {
        if (cambios[campo] !== undefined) {
            if (['precio', 'orden'].includes(campo)) {
                actualizacion[campo] = Number(cambios[campo]);
            } else {
                actualizacion[campo] = cambios[campo];
            }
        }
    }

    await db.collection(COLECCION).doc(id).update(actualizacion);
    return { id, ...actualizacion };
}

async function eliminarProductoPermanente(id) {
    await db.collection(COLECCION).doc(id).delete();
    return { id, eliminado: true };
}

module.exports = {
    listarActivos,
    listarTodos,
    crearProducto,
    actualizarProducto,
    eliminarProductoPermanente
};