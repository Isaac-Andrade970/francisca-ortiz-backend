// SERVICIO DE EMAIL \\

// Maneja el envío de emails de confirmación de reservas.

const nodemailer = require('nodemailer');
require('dotenv').config();

// CONFIGURACIÓN DEL TRANSPORTADOR \\

// Esto crea la "conexión" con Gmail. Usa la cuenta y contraseña de aplicación del .env

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// FUNCIONES \\

/**
 * Envía email de confirmación a la clienta que reservó.
 * @param {Object} reserva - Datos de la reserva
 */
async function enviarEmailClienta(reserva) {
    const fechaFormateada = new Date(reserva.inicio).toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const horaFormateada = new Date(reserva.inicio).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #A56B82; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">Francisca Ortiz</h1>
                <p style="margin: 5px 0 0 0; letter-spacing: 3px; font-size: 12px;">PELUQUERÍA Y MANICURE</p>
            </div>

            <div style="background-color: #FBF3EC; padding: 30px; border-radius: 0 0 12px 12px;">
                <h2 style="color: #2B2B2B; margin-top: 0;">¡Reserva confirmada!</h2>
                <p style="color: #5E4D47;">Hola ${reserva.cliente},</p>
                <p style="color: #5E4D47;">Recibimos tu solicitud de reserva. Acá los detalles:</p>

                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Servicio:</strong> ${reserva.servicio}</p>
                    <p style="margin: 5px 0;"><strong>Fecha:</strong> ${fechaFormateada}</p>
                    <p style="margin: 5px 0;"><strong>Hora:</strong> ${horaFormateada}</p>
                </div>

                <div style="background-color: #F5E8DE; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <h3 style="margin-top: 0; color: #8B4A6B;">Asegura tu reserva con el abono</h3>
                    <p style="color: #5E4D47; margin: 10px 0 20px 0;">
                        Para confirmar tu cita, realiza el abono de <strong>$10.000</strong>.
                        Este monto se descuenta del total del servicio.
                    </p>
    
                    <a href="${process.env.SUMUP_PAYMENT_LINK}"
                        style="display: inline-block; background-color: #A56B82; color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        💳 PAGAR ABONO AHORA
                    </a>
    
                    <p style="color: #5E4D47; font-size: 13px; margin-top: 15px;">
                        Pago seguro con tarjeta de débito o crédito vía SumUp.<br>
                        Recibirás confirmación automática al pagar.
                    </p>
                </div>

                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #E8D5C8;">
                    <h3 style="margin-top: 0; color: #8B4A6B;">¿Necesitas cambiar tu hora?</h3>
                    <p style="color: #5E4D47; margin: 10px 0 20px 0; font-size: 14px;">
                        Puedes reagendar tu cita 1 vez con al menos 48 horas de anticipación.
                    </p>
    
                    <a href="http://localhost:5501/reagendar.html?token=${reserva.tokenReagendar}"
                        style="display: inline-block; background-color: transparent; color: #A56B82; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: 500; border: 2px solid #A56B82; font-size: 14px;">
                        📅 Reagendar mi cita
                    </a>
                </div>


                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #8B4A6B;">Política de reagendamiento</h3>
                    <p style="color: #5E4D47; margin: 5px 0;">
                        Puedes reagendar tu cita 1 vez con al menos 48 horas de anticipación.
                        Si quisieras reagendar por segunda vez o cancelar, el abono no se devuelve.
                    </p>
                </div>

                <p style="color: #5E4D47; margin-top: 30px;">
                    <strong>Dirección:</strong> Catan 1254, Quinta Normal<br>
                    Recuerda llegar puntual (tolerancia máxima de 15 minutos).
                </p>

                <p style="color: #5E4D47;">
                    Cualquier duda, escríbenos por WhatsApp. ¡Te esperamos!
                </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #5E4D47; font-size: 12px;">
                Francisca Ortiz · Peluquería y Manicure · Catan 1254, Quinta Normal
            </div>
        </div>
    `;

    const opciones = {
        from: `"Francisca Ortiz Studio" <${process.env.EMAIL_USER}>`,
        to: reserva.email,
        subject: `Tu reserva en Francisca Ortiz Studio - ${fechaFormateada}`,
        html: html
    };

    return await transporter.sendMail(opciones);
}

/**
 * Envía email de aviso a Francisca cuando alguien reserva.
 * @param {Object} reserva - Datos de la reserva
 */
async function enviarEmailFrancisca(reserva) {
    const fechaFormateada = new Date(reserva.inicio).toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const horaFormateada = new Date(reserva.inicio).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #8B4A6B;">Nueva reserva en tu sitio web</h2>

            <div style="background-color: #FBF3EC; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2B2B2B;">Datos de la reserva</h3>
                <p><strong>Servicio:</strong> ${reserva.servicio}</p>
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                <p><strong>Hora:</strong> ${horaFormateada}</p>
            </div>

            <div style="background-color: white; border: 1px solid #E8D5C8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2B2B2B;">Datos de la clienta</h3>
                <p><strong>Nombre:</strong> ${reserva.cliente}</p>
                <p><strong>WhatsApp:</strong> ${reserva.telefono}</p>
                <p><strong>Email:</strong> ${reserva.email}</p>
                ${reserva.notas ? `<p><strong>Notas:</strong> ${reserva.notas}</p>` : ''}
            </div>

            <p style="color: #5E4D47;">
                La reserva ya está agendada en tu Google Calendar como
                "Reservas Studio". Recuerda confirmar el abono con la
                clienta antes de la cita.
            </p>
        </div>
    `;

    const opciones = {
        from: `"Sistema de Reservas" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `Nueva reserva: ${reserva.cliente} - ${fechaFormateada} ${horaFormateada}`,
        html: html
    };

    return await transporter.sendMail(opciones);
}

/**
 * Envía email pidiendo reseña a la clienta después del servicio
 */
async function enviarEmailResena(datos) {
    const linkResena = `http://localhost:5500/califica-tu-servicio.html?token=${datos.tokenReagendar}`;
    // ⚠️ Después cambiamos localhost:5500 por el dominio real cuando hagamos deploy

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #A56B82; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">Francisca Ortiz</h1>
                <p style="margin: 5px 0 0 0; letter-spacing: 3px; font-size: 12px;">PELUQUERÍA Y MANICURE</p>
            </div>

            <div style="background-color: #FBF3EC; padding: 30px; border-radius: 0 0 12px 12px;">
                <h2 style="color: #2B2B2B; margin-top: 0;">¿Cómo te quedó tu ${datos.servicio}?</h2>
                <p style="color: #5E4D47;">Hola ${datos.cliente},</p>
                <p style="color: #5E4D47;">
                    Espero que hayas quedado feliz con tu servicio. Me encantaría 
                    saber tu opinión, me ayuda muchísimo a mejorar y también a que 
                    otras personas conozcan mi trabajo.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${linkResena}"
                       style="display: inline-block; background-color: #A56B82; color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        ⭐ DEJAR MI RESEÑA
                    </a>
                </div>

                <p style="color: #5E4D47; font-size: 13px; text-align: center;">
                    Solo te tomará 1 minuto. ¡Gracias!
                </p>

                <p style="color: #5E4D47; margin-top: 30px;">
                    Un abrazo,<br>
                    Francisca
                </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #5E4D47; font-size: 12px;">
                Francisca Ortiz · Peluquería y Manicure · Catan 1254, Quinta Normal
            </div>
        </div>
    `;

    const opciones = {
        from: `"Francisca Ortiz Studio" <${process.env.EMAIL_USER}>`,
        to: datos.email,
        subject: `${datos.cliente}, ¿cómo te quedó tu servicio?`,
        html: html
    };

    return await transporter.sendMail(opciones);
}

/**
 * Email a la clienta confirmando el reagendamiento
 */
async function enviarEmailReagendamientoClienta(datos) {
    const fechaFormateada = new Date(datos.nuevaFechaInicio).toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const horaFormateada = new Date(datos.nuevaFechaInicio).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #A56B82; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">Francisca Ortiz</h1>
                <p style="margin: 5px 0 0 0; letter-spacing: 3px; font-size: 12px;">PELUQUERÍA Y MANICURE</p>
            </div>

            <div style="background-color: #FBF3EC; padding: 30px; border-radius: 0 0 12px 12px;">
                <h2 style="color: #2B2B2B; margin-top: 0;">¡Reagendamiento confirmado!</h2>
                <p style="color: #5E4D47;">Hola ${datos.cliente},</p>
                <p style="color: #5E4D47;">Tu cita fue actualizada exitosamente. Estos son los nuevos detalles:</p>

                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Servicio:</strong> ${datos.servicio}</p>
                    <p style="margin: 5px 0;"><strong>Nueva fecha:</strong> ${fechaFormateada}</p>
                    <p style="margin: 5px 0;"><strong>Nueva hora:</strong> ${horaFormateada}</p>
                </div>

                <div style="background-color: #F5E8DE; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #8B4A6B;">⚠️ Importante</h3>
                    <p style="color: #5E4D47; margin: 5px 0;">
                        Ya usaste tu único reagendamiento. No se podrán hacer más cambios a esta cita.
                        En caso de cancelación o ausencia, el abono no se devuelve.
                    </p>
                </div>

                <p style="color: #5E4D47; margin-top: 30px;">
                    <strong>Dirección:</strong> Catan 1254, Quinta Normal<br>
                    Recuerda llegar puntual (tolerancia máxima de 15 minutos).
                </p>

                <p style="color: #5E4D47;">
                    Cualquier duda, escríbenos por WhatsApp. ¡Te esperamos!
                </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #5E4D47; font-size: 12px;">
                Francisca Ortiz · Peluquería y Manicure · Catan 1254, Quinta Normal
            </div>
        </div>
    `;

    return await transporter.sendMail({
        from: `"Francisca Ortiz Studio" <${process.env.EMAIL_USER}>`,
        to: datos.email,
        subject: `Reagendamiento confirmado - ${fechaFormateada}`,
        html: html
    });
}

/**
 * Email a Francisca avisando del reagendamiento
 */
async function enviarEmailReagendamientoFrancisca(datos) {
    const fechaAnterior = new Date(datos.fechaAnterior).toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const horaAnterior = new Date(datos.fechaAnterior).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const fechaNueva = new Date(datos.nuevaFechaInicio).toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const horaNueva = new Date(datos.nuevaFechaInicio).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #C08870; color: white; padding: 25px; text-align: center; border-radius: 12px 12px 0 0;">
                <h2 style="margin: 0;">Reagendamiento de reserva</h2>
            </div>

            <div style="background-color: #FBF3EC; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="color: #5E4D47;">
                    <strong>${datos.cliente}</strong> reagendó su cita.
                </p>

                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #2B2B2B;">Cambios</h3>
                    <p style="margin: 8px 0; color: #5E4D47;">
                        <strong>Servicio:</strong> ${datos.servicio}
                    </p>
                    <p style="margin: 8px 0; color: #5E4D47; text-decoration: line-through;">
                        <strong>Antes:</strong> ${fechaAnterior} a las ${horaAnterior}
                    </p>
                    <p style="margin: 8px 0; color: #8B4A6B;">
                        <strong>Ahora:</strong> ${fechaNueva} a las ${horaNueva}
                    </p>
                </div>

                <div style="background-color: #F5E8DE; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #5E4D47; margin: 5px 0; font-size: 14px;">
                        ✅ El evento en tu Google Calendar ya fue actualizado automáticamente.
                    </p>
                    <p style="color: #5E4D47; margin: 5px 0; font-size: 14px;">
                        ℹ️ Esta es su única posibilidad de reagendar. Si pide otro cambio, no será posible desde el sistema.
                    </p>
                </div>
            </div>
        </div>
    `;

    return await transporter.sendMail({
        from: `"Sistema de Reservas" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `${datos.cliente} reagendó: ${fechaNueva} ${horaNueva}`,
        html: html
    });
}

module.exports = {
    enviarEmailClienta,
    enviarEmailFrancisca,
    enviarEmailResena,
    enviarEmailReagendamientoClienta,
    enviarEmailReagendamientoFrancisca
};