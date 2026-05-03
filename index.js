// SERVIDOR PRINCIPAL \\

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reservasRoutes = require('./src/routes/reservas');
const app = express();

// MIDDLEWARES \\

app.use(cors());
app.use(express.json());
app.use((request, response, next) => {
    console.log(`${new Date().toISOString()} - ${request.method} ${request.path}`);
    next();
});

// RUTAS \\

app.get('/', (request, response) => {
    response.json({
        mensaje: 'Backend de Francisca Ortiz Studio',
        estado: 'funcionando',
        version: '1.0.0'
    });
});

app.use('/api/reservas', reservasRoutes);
app.use((request, response) => {
    response.status(404).json({
        error: 'Ruta no encontrada'
    });
});

// ARRANCAR SV \\

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('====================================');
    console.log(`  Servidor corriendo en puerto ${PORT}`);
    console.log(`  http://localhost:${PORT}`);
    console.log('====================================');
});