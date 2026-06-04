const express = require('express');
const router = express.Router();
const productosService = require('../services/productos');
const { protegerAdmin, protegerSuperadmin } = require('../services/auth');

// PÚBLICO: lista los activos (lo lee la tienda y el home)
router.get('/', async (request, response) => {
    try {
        const productos = await productosService.listarActivos();
        response.json({ productos });
    } catch (error) {
        console.error('Error al listar productos:', error);
        response.status(500).json({ error: 'Error al cargar productos' });
    }
});

// ADMIN: incluye los desactivados
router.get('/admin/todos', protegerAdmin, async (request, response) => {
    try {
        const productos = await productosService.listarTodos();
        response.json({ productos });
    } catch (error) {
        console.error('Error al listar todos los productos:', error);
        response.status(500).json({ error: 'Error al cargar productos' });
    }
});

// ADMIN: crear
router.post('/', protegerAdmin, async (request, response) => {
    try {
        if (!request.body.nombre || request.body.precio === undefined) {
            return response.status(400).json({ error: 'Faltan datos: nombre y precio son obligatorios' });
        }
        const producto = await productosService.crearProducto(request.body);
        response.status(201).json({ mensaje: 'Producto creado', producto });
    } catch (error) {
        console.error('Error al crear producto:', error);
        response.status(500).json({ error: 'Error al crear producto' });
    }
});

// ADMIN: editar
router.patch('/:id', protegerAdmin, async (request, response) => {
    try {
        const producto = await productosService.actualizarProducto(request.params.id, request.body);
        response.json({ mensaje: 'Producto actualizado', producto });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        response.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// SOLO SUPERADMIN: borrado permanente
router.delete('/:id', protegerSuperadmin, async (request, response) => {
    try {
        await productosService.eliminarProductoPermanente(request.params.id);
        response.json({ mensaje: 'Producto eliminado permanentemente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        response.status(500).json({ error: 'Error al eliminar producto' });
    }
});

module.exports = router;