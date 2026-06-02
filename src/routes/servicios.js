const express = require('express');
const router = express.Router();
const serviciosService = require('../services/servicios');
const { protegerAdmin, protegerSuperadmin } = require('../services/auth');

// PÚBLICO \\

// GET /api/servicios - lista los activos (lo lee la web pública)
router.get('/', async (request, response) => {
    try {
        const servicios = await serviciosService.listarServiciosActivos();
        response.json({ servicios });
    } catch (error) {
        console.error('Error al listar servicios:', error);
        response.status(500).json({ error: 'Error al cargar servicios' });
    }
});

// ADMIN \\

// GET /api/servicios/admin/todos - incluye los desactivados
router.get('/admin/todos', protegerAdmin, async (request, response) => {
    try {
        const servicios = await serviciosService.listarTodos();
        response.json({ servicios });
    } catch (error) {
        console.error('Error al listar todos:', error);
        response.status(500).json({ error: 'Error al cargar servicios' });
    }
});

// POST /api/servicios - crear servicio
router.post('/', protegerAdmin, async (request, response) => {
    try {
        if (!request.body.nombre || request.body.precio === undefined || request.body.duracion === undefined) {
            return response.status(400).json({ error: 'Faltan datos: nombre, precio y duración son obligatorios' });
        }
        const servicio = await serviciosService.crearServicio(request.body);
        response.status(201).json({ mensaje: 'Servicio creado', servicio });
    } catch (error) {
        console.error('Error al crear servicio:', error);
        response.status(500).json({ error: 'Error al crear servicio' });
    }
});

// PATCH /api/servicios/:id - editar servicio
router.patch('/:id', protegerAdmin, async (request, response) => {
    try {
        const servicio = await serviciosService.actualizarServicio(request.params.id, request.body);
        response.json({ mensaje: 'Servicio actualizado', servicio });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        response.status(500).json({ error: 'Error al actualizar servicio' });
    }
});

// PATCH /api/servicios/:id/desactivar - apagar sin borrar (camino seguro)
router.patch('/:id/desactivar', protegerAdmin, async (request, response) => {
    try {
        await serviciosService.desactivarServicio(request.params.id);
        response.json({ mensaje: 'Servicio desactivado' });
    } catch (error) {
        console.error('Error al desactivar servicio:', error);
        response.status(500).json({ error: 'Error al desactivar servicio' });
    }
});

// SOLO SUPERADMIN (emergencia) \\

// DELETE /api/servicios/:id - borrado PERMANENTE
router.delete('/:id', protegerSuperadmin, async (request, response) => {
    try {
        await serviciosService.eliminarServicioPermanente(request.params.id);
        response.json({ mensaje: 'Servicio eliminado permanentemente' });
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        response.status(500).json({ error: 'Error al eliminar servicio' });
    }
});

module.exports = router;