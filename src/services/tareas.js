// TAREAS PROGRAMADAS (CRON JOBS) \\

// Tareas que se ejecutan automáticamente cada cierto tiempo

const cron = require('node-cron');
const db = require('./firebase');
const email = require('./email');

/**
 * Tarea: marcar reservas pasadas como "completadas"
 * Y mandar email de reseña 24h después de la cita
 */
async function procesarReservasPasadas() {
    console.log('🔄 [CRON] Procesando reservas pasadas...');

    try {
        const ahora = new Date();
        const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

        // Buscar reservas confirmadas que terminaron hace más de 24h
        // y que aún no se les envió email de reseña
        const snapshot = await db.collection('reservas')
            .where('estado', 'in', ['pendiente', 'confirmada'])
            .where('emailResenaEnviado', '==', false)
            .get();

        let procesadas = 0;
        let errores = 0;

        for (const doc of snapshot.docs) {
            const reserva = { id: doc.id, ...doc.data() };

            // NO procesar si la reserva fue cancelada
            if (reserva.estado === 'cancelada') {
                continue;
            }

            // Firestore guarda timestamps como objetos especiales
            const fechaFin = reserva.fechaFin.toDate ? reserva.fechaFin.toDate() : reserva.fechaFin;

            // Solo procesar reservas que terminaron hace 24h o más
            if (fechaFin > hace24h) {
                continue;
            }

            try {
                // 1. Marcar como completada
                await doc.ref.update({
                    estado: 'completada'
                });

                // 2. Enviar email de reseña
                await email.enviarEmailResena({
                    cliente: reserva.cliente,
                    email: reserva.email,
                    servicio: reserva.servicios.join(', '),
                    tokenReagendar: reserva.tokenReagendar
                });

                // 3. Marcar email como enviado
                await doc.ref.update({
                    emailResenaEnviado: true
                });

                procesadas++;
                console.log(`  ✅ Procesada reserva de ${reserva.cliente}`);

            } catch (errorReserva) {
                errores++;
                console.error(`  ❌ Error con reserva ${doc.id}:`, errorReserva.message);
            }
        }

        console.log(`✅ [CRON] Completado. Procesadas: ${procesadas}, Errores: ${errores}`);

    } catch (error) {
        console.error('❌ [CRON] Error general:', error.message);
    }
}

/**
 * Tarea: mandar recordatorio por email 48h antes de la cita.
 * El corte se pone en 49h (colchón de 1 hora) para que, pese al desfase
 * del cron (corre cada hora), a la clienta siempre le queden ~48h reales
 * para poder reagendar si hace clic en el botón del correo.
 */
async function procesarRecordatorios() {
    console.log('🔄 [CRON] Procesando recordatorios...');

    try {
        const ahora = new Date();
        const en49h = new Date(ahora.getTime() + 49 * 60 * 60 * 1000);

        const snapshot = await db.collection('reservas')
            .where('estado', 'in', ['pendiente', 'confirmada'])
            .where('emailRecordatorioEnviado', '==', false)
            .get();

        let procesadas = 0;
        let errores = 0;

        for (const doc of snapshot.docs) {
            const reserva = { id: doc.id, ...doc.data() };

            const fechaInicio = reserva.fechaInicio.toDate ? reserva.fechaInicio.toDate() : reserva.fechaInicio;

            // Todavía falta más de 49h: no toca aún
            if (fechaInicio > en49h) {
                continue;
            }

            // La cita ya pasó: no corresponde recordatorio
            if (fechaInicio < ahora) {
                continue;
            }

            try {
                await email.enviarEmailRecordatorio({
                    cliente: reserva.cliente,
                    email: reserva.email,
                    servicio: reserva.servicios.join(', '),
                    inicio: fechaInicio,
                    tokenReagendar: reserva.tokenReagendar
                });

                await doc.ref.update({
                    emailRecordatorioEnviado: true
                });

                procesadas++;
                console.log(`  ✅ Recordatorio enviado a ${reserva.cliente}`);

            } catch (errorReserva) {
                errores++;
                console.error(`  ❌ Error con reserva ${doc.id}:`, errorReserva.message);
            }
        }

        console.log(`✅ [CRON] Completado. Procesadas: ${procesadas}, Errores: ${errores}`);

    } catch (error) {
        console.error('❌ [CRON] Error general:', error.message);
    }
}

/**
 * Iniciar todas las tareas programadas
 */
function iniciarTareas() {
    // Cada hora en punto, revisar reservas pasadas y recordatorios
    // Formato cron: minuto hora día_mes mes día_semana
    // '0 * * * *' = en el minuto 0 de cada hora
    cron.schedule('0 * * * *', () => {
        procesarReservasPasadas();
        procesarRecordatorios();
    });

    console.log('⏰ Tareas programadas iniciadas');
    console.log('   - Procesar reservas pasadas: cada hora en punto');
    console.log('   - Procesar recordatorios: cada hora en punto');
}

module.exports = {
    iniciarTareas,
    procesarReservasPasadas, // exportar para poder probar manualmente
    procesarRecordatorios // exportar para poder probar manualmente
};