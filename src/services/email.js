// SERVICIO DE EMAIL \\

// Maneja el envío de emails de confirmación de reservas.

const nodemailer = require('nodemailer');
require('dotenv').config();

// CONFIGURACIÓN CENTRAL \\


const URL_SITIO = process.env.URL_SITIO || 'http://localhost:5501';

// Paleta de colores (la misma del sitio web)
const COLOR = {
    rosaOscuro: '#8B4A6B',
    rosa: '#A56B82',
    cobre: '#C08870',
    cobreSuave: '#D4A391',
    crema: '#F5E8DE',
    cremaClara: '#FBF3EC',
    nude: '#E8D5C8',
    textoOscuro: '#2B2B2B',
    textoSuave: '#5E4D47',
    blanco: '#FFFFFF'
};

// CONFIGURACIÓN DEL TRANSPORTADOR \\

// Esto crea la "conexión" con Gmail. Usa la cuenta y contraseña de aplicación del .env

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// COMPONENTES REUTILIZABLES \\

// El encabezado de marca que se repite en todos los emails de la clienta.
function encabezado() {
    return `
        <tr>
            <td style="background: linear-gradient(135deg, ${COLOR.rosaOscuro} 0%, ${COLOR.rosa} 100%); padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 30px; color: ${COLOR.blanco}; font-family: Georgia, 'Times New Roman', serif; font-weight: normal; letter-spacing: 1px;">Francisca Ortiz</h1>
                <p style="margin: 8px 0 0 0; letter-spacing: 4px; font-size: 11px; color: ${COLOR.cremaClara};">PELUQUERÍA Y MANICURE</p>
            </td>
        </tr>
    `;
}

// El pie de página que se repite en todos los emails.
function pie() {
    return `
        <tr>
            <td style="background-color: ${COLOR.rosaOscuro}; padding: 30px; text-align: center;">
                <p style="margin: 0 0 6px 0; color: ${COLOR.crema}; font-size: 13px; font-weight: 600;">Francisca Ortiz · Peluquería y Manicure</p>
                <p style="margin: 0; color: ${COLOR.cobreSuave}; font-size: 12px;">Catán 1254, Quinta Normal · Región Metropolitana</p>
            </td>
        </tr>
    `;
}

// Envuelve el contenido en la estructura base (tabla centrada, responsive).
function plantilla(contenidoInterno) {
    return `
    <body style="margin: 0; padding: 0; background-color: ${COLOR.crema};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLOR.crema}; padding: 24px 12px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: ${COLOR.blanco}; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(139,74,107,0.12);">
                        ${encabezado()}
                        <tr>
                            <td style="padding: 40px 35px;">
                                ${contenidoInterno}
                            </td>
                        </tr>
                        ${pie()}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    `;
}

// Genera un botón principal (relleno).
function botonPrimario(texto, link) {
    return `
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
                <td style="background: linear-gradient(135deg, ${COLOR.rosa} 0%, ${COLOR.rosaOscuro} 100%); border-radius: 50px;">
                    <a href="${link}" target="_blank" style="display: inline-block; padding: 16px 44px; color: ${COLOR.blanco}; text-decoration: none; font-weight: 600; font-size: 16px; font-family: Arial, sans-serif;">${texto}</a>
                </td>
            </tr>
        </table>
    `;
}

// Genera un botón secundario (borde).
function botonSecundario(texto, link) {
    return `
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
                <td style="border: 2px solid ${COLOR.rosa}; border-radius: 50px;">
                    <a href="${link}" target="_blank" style="display: inline-block; padding: 12px 34px; color: ${COLOR.rosa}; text-decoration: none; font-weight: 500; font-size: 14px; font-family: Arial, sans-serif;">${texto}</a>
                </td>
            </tr>
        </table>
    `;
}

// Genera una fila de detalle (etiqueta + valor) para los recuadros.
function filaDetalle(etiqueta, valor) {
    return `
        <p style="margin: 0 0 10px 0; color: ${COLOR.textoSuave}; font-size: 15px;">
            <span style="color: ${COLOR.cobre}; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 2px;">${etiqueta}</span>
            <strong style="color: ${COLOR.textoOscuro}; font-size: 16px;">${valor}</strong>
        </p>
    `;
}

// FUNCIONES DE FORMATEO DE FECHAS \\

function formatearFechaLarga(fecha) {
    return new Date(fecha).toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatearHora(fecha) {
    return new Date(fecha).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatearFechaCorta(fecha) {
    return new Date(fecha).toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
}

// FUNCIONES DE ENVÍO \\

/**
 * Envía email de confirmación a la clienta que reservó.
 * @param {Object} reserva - Datos de la reserva
 */
async function enviarEmailClienta(reserva) {
    const fechaFormateada = formatearFechaLarga(reserva.inicio);
    const horaFormateada = formatearHora(reserva.inicio);

    const linkPago = process.env.SUMUP_PAYMENT_LINK;
    const linkReagendar = `${URL_SITIO}/reagendar.html?token=${reserva.tokenReagendar}`;

    const contenido = `
        <h2 style="color: ${COLOR.textoOscuro}; margin: 0 0 8px 0; font-family: Georgia, serif; font-weight: normal; font-size: 26px;">¡Reserva recibida!</h2>
        <p style="color: ${COLOR.textoSuave}; font-size: 15px; margin: 0 0 6px 0;">Hola ${reserva.cliente},</p>
        <p style="color: ${COLOR.textoSuave}; font-size: 15px; margin: 0 0 28px 0;">Recibimos tu solicitud de reserva. Estos son los detalles:</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLOR.cremaClara}; border-radius: 12px; margin-bottom: 28px;">
            <tr><td style="padding: 24px 26px;">
                ${filaDetalle('Servicio', reserva.servicio)}
                ${filaDetalle('Fecha', fechaFormateada)}
                <p style="margin: 0; color: ${COLOR.textoSuave};">
                    <span style="color: ${COLOR.cobre}; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 2px;">Hora</span>
                    <strong style="color: ${COLOR.textoOscuro}; font-size: 16px;">${horaFormateada}</strong>
                </p>
            </td></tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLOR.crema}; border-radius: 12px; margin-bottom: 24px;">
            <tr><td style="padding: 28px 26px; text-align: center;">
                <h3 style="margin: 0 0 8px 0; color: ${COLOR.rosaOscuro}; font-family: Georgia, serif; font-weight: normal; font-size: 20px;">Asegura tu reserva con el abono</h3>
                <p style="color: ${COLOR.textoSuave}; margin: 0 0 22px 0; font-size: 14px;">
                    Para confirmar tu cita, realiza el abono de <strong>$10.000</strong>.<br>Este monto se descuenta del total del servicio.
                </p>
                ${botonPrimario('💳 Pagar abono ahora', linkPago)}
                <p style="color: ${COLOR.textoSuave}; font-size: 12px; margin: 18px 0 0 0;">
                    Pago seguro con tarjeta vía SumUp.
                </p>
            </td></tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLOR.cremaClara}; border-radius: 12px; margin-bottom: 24px;">
            <tr><td style="padding: 26px; text-align: center;">
                <h3 style="margin: 0 0 8px 0; color: ${COLOR.rosaOscuro}; font-family: Georgia, serif; font-weight: normal; font-size: 19px;">¿Necesitas cambiar tu hora?</h3>
                <p style="color: ${COLOR.textoSuave}; margin: 0 0 20px 0; font-size: 14px;">
                    Puedes reagendar tu cita 1 vez con al menos 48 horas de anticipación.
                </p>
                ${botonSecundario('📅 Reagendar mi cita', linkReagendar)}
            </td></tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid ${COLOR.nude}; border-radius: 12px; margin-bottom: 24px;">
            <tr><td style="padding: 22px 26px;">
                <h3 style="margin: 0 0 8px 0; color: ${COLOR.rosaOscuro}; font-size: 15px;">Política de reagendamiento</h3>
                <p style="color: ${COLOR.textoSuave}; margin: 0; font-size: 13px; line-height: 1.6;">
                    Puedes reagendar tu cita 1 vez con al menos 48 horas de anticipación.
                    Si quisieras reagendar por segunda vez o cancelar, el abono no se devuelve.
                </p>
            </td></tr>
        </table>

        <p style="color: ${COLOR.textoSuave}; font-size: 14px; line-height: 1.7; margin: 0 0 8px 0;">
            <strong>Dirección:</strong> Catán 1254, Quinta Normal<br>
            Recuerda llegar puntual (tolerancia máxima de 15 minutos).
        </p>
        <p style="color: ${COLOR.textoSuave}; font-size: 14px; margin: 0;">
            Cualquier duda, escríbenos por WhatsApp. ¡Te esperamos!
        </p>
    `;

    const opciones = {
        from: `"Francisca Ortiz Studio" <${process.env.EMAIL_USER}>`,
        to: reserva.email,
        subject: `Tu reserva en Francisca Ortiz Studio - ${fechaFormateada}`,
        html: plantilla(contenido)
    };

    return await transporter.sendMail(opciones);
}

/**
 * Envía email de aviso a Francisca cuando alguien reserva.
 * @param {Object} reserva - Datos de la reserva
 */
async function enviarEmailFrancisca(reserva) {
    const fechaFormateada = formatearFechaLarga(reserva.inicio);
    const horaFormateada = formatearHora(reserva.inicio);

    const contenido = `
        <h2 style="color: ${COLOR.rosaOscuro}; margin: 0 0 24px 0; font-family: Georgia, serif; font-weight: normal; font-size: 24px;">Nueva reserva en tu sitio web</h2>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLOR.cremaClara}; border-radius: 12px; margin-bottom: 20px;">
            <tr><td style="padding: 24px 26px;">
                <h3 style="margin: 0 0 16px 0; color: ${COLOR.textoOscuro}; font-size: 15px;">Datos de la reserva</h3>
                ${filaDetalle('Servicio', reserva.servicio)}
                ${filaDetalle('Fecha', fechaFormateada)}
                <p style="margin: 0; color: ${COLOR.textoSuave};">
                    <span style="color: ${COLOR.cobre}; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 2px;">Hora</span>
                    <strong style="color: ${COLOR.textoOscuro}; font-size: 16px;">${horaFormateada}</strong>
                </p>
            </td></tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid ${COLOR.nude}; border-radius: 12px; margin-bottom: 24px;">
            <tr><td style="padding: 24px 26px;">
                <h3 style="margin: 0 0 16px 0; color: ${COLOR.textoOscuro}; font-size: 15px;">Datos de la clienta</h3>
                ${filaDetalle('Nombre', reserva.cliente)}
                ${filaDetalle('WhatsApp', reserva.telefono)}
                ${filaDetalle('Email', reserva.email)}
                ${reserva.notas ? `
                <p style="margin: 0; color: ${COLOR.textoSuave};">
                    <span style="color: ${COLOR.cobre}; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 2px;">Notas</span>
                    <strong style="color: ${COLOR.textoOscuro}; font-size: 15px;">${reserva.notas}</strong>
                </p>` : ''}
            </td></tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLOR.crema}; border-radius: 12px;">
            <tr><td style="padding: 20px 26px;">
                <p style="color: ${COLOR.textoSuave}; margin: 0; font-size: 14px; line-height: 1.6;">
                    La reserva ya está agendada en tu Google Calendar como "Reservas Studio".
                    La clienta ya recibió el link de pago automáticamente.
                    Espera la notificación de SumUp y luego cambia <strong>[PENDIENTE PAGO]</strong> por <strong>[CONFIRMADA]</strong> en el evento.
                </p>
            </td></tr>
        </table>
    `;

    const opciones = {
        from: `"Sistema de Reservas" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `Nueva reserva: ${reserva.cliente} - ${fechaFormateada} ${horaFormateada}`,
        html: plantilla(contenido)
    };

    return await transporter.sendMail(opciones);
}

/**
 * Envía email pidiendo reseña a la clienta después del servicio
 */
async function enviarEmailResena(datos) {
    const linkResena = `${URL_SITIO}/califica-tu-servicio.html?token=${datos.tokenReagendar}`;

    const contenido = `
        <h2 style="color: ${COLOR.textoOscuro}; margin: 0 0 8px 0; font-family: Georgia, serif; font-weight: normal; font-size: 26px;">¿Cómo te quedó tu ${datos.servicio}?</h2>
        <p style="color: ${COLOR.textoSuave}; font-size: 15px; margin: 0 0 6px 0;">Hola ${datos.cliente},</p>
        <p style="color: ${COLOR.textoSuave}; font-size: 15px; line-height: 1.7; margin: 0 0 30px 0;">
            Espero que hayas quedado feliz con tu servicio. Me encantaría saber tu opinión:
            me ayuda muchísimo a mejorar y también a que otras personas conozcan mi trabajo.
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLOR.cremaClara}; border-radius: 12px; margin-bottom: 24px;">
            <tr><td style="padding: 36px 26px; text-align: center;">
                <p style="color: ${COLOR.cobre}; font-size: 32px; margin: 0 0 16px 0; letter-spacing: 6px;">★★★★★</p>
                ${botonPrimario('⭐ Dejar mi reseña', linkResena)}
                <p style="color: ${COLOR.textoSuave}; font-size: 13px; margin: 18px 0 0 0;">
                    Solo te tomará 1 minuto. ¡Gracias!
                </p>
            </td></tr>
        </table>

        <p style="color: ${COLOR.textoSuave}; font-size: 15px; margin: 0;">
            Un abrazo,<br>
            <strong style="color: ${COLOR.rosaOscuro};">Francisca</strong>
        </p>
    `;

    const opciones = {
        from: `"Francisca Ortiz Studio" <${process.env.EMAIL_USER}>`,
        to: datos.email,
        subject: `${datos.cliente}, ¿cómo te quedó tu servicio?`,
        html: plantilla(contenido)
    };

    return await transporter.sendMail(opciones);
}

/**
 * Email a la clienta confirmando el reagendamiento
 */
async function enviarEmailReagendamientoClienta(datos) {
    const fechaFormateada = formatearFechaLarga(datos.nuevaFechaInicio);
    const horaFormateada = formatearHora(datos.nuevaFechaInicio);

    const contenido = `
        <h2 style="color: ${COLOR.textoOscuro}; margin: 0 0 8px 0; font-family: Georgia, serif; font-weight: normal; font-size: 26px;">¡Reagendamiento confirmado!</h2>
        <p style="color: ${COLOR.textoSuave}; font-size: 15px; margin: 0 0 6px 0;">Hola ${datos.cliente},</p>
        <p style="color: ${COLOR.textoSuave}; font-size: 15px; margin: 0 0 28px 0;">Tu cita fue actualizada exitosamente. Estos son los nuevos detalles:</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLOR.cremaClara}; border-radius: 12px; margin-bottom: 24px;">
            <tr><td style="padding: 24px 26px;">
                ${filaDetalle('Servicio', datos.servicio)}
                ${filaDetalle('Nueva fecha', fechaFormateada)}
                <p style="margin: 0; color: ${COLOR.textoSuave};">
                    <span style="color: ${COLOR.cobre}; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 2px;">Nueva hora</span>
                    <strong style="color: ${COLOR.textoOscuro}; font-size: 16px;">${horaFormateada}</strong>
                </p>
            </td></tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLOR.crema}; border-radius: 12px; margin-bottom: 24px;">
            <tr><td style="padding: 22px 26px;">
                <h3 style="margin: 0 0 8px 0; color: ${COLOR.rosaOscuro}; font-size: 15px;">⚠️ Importante</h3>
                <p style="color: ${COLOR.textoSuave}; margin: 0; font-size: 13px; line-height: 1.6;">
                    Ya usaste tu único reagendamiento. No se podrán hacer más cambios a esta cita.
                    En caso de cancelación o ausencia, el abono no se devuelve.
                </p>
            </td></tr>
        </table>

        <p style="color: ${COLOR.textoSuave}; font-size: 14px; line-height: 1.7; margin: 0 0 8px 0;">
            <strong>Dirección:</strong> Catán 1254, Quinta Normal<br>
            Recuerda llegar puntual (tolerancia máxima de 15 minutos).
        </p>
        <p style="color: ${COLOR.textoSuave}; font-size: 14px; margin: 0;">
            Cualquier duda, escríbenos por WhatsApp. ¡Te esperamos!
        </p>
    `;

    return await transporter.sendMail({
        from: `"Francisca Ortiz Studio" <${process.env.EMAIL_USER}>`,
        to: datos.email,
        subject: `Reagendamiento confirmado - ${fechaFormateada}`,
        html: plantilla(contenido)
    });
}

/**
 * Email a Francisca avisando del reagendamiento
 */
async function enviarEmailReagendamientoFrancisca(datos) {
    const fechaAnterior = formatearFechaCorta(datos.fechaAnterior);
    const horaAnterior = formatearHora(datos.fechaAnterior);
    const fechaNueva = formatearFechaCorta(datos.nuevaFechaInicio);
    const horaNueva = formatearHora(datos.nuevaFechaInicio);

    const contenido = `
        <h2 style="color: ${COLOR.rosaOscuro}; margin: 0 0 20px 0; font-family: Georgia, serif; font-weight: normal; font-size: 24px;">Reagendamiento de reserva</h2>

        <p style="color: ${COLOR.textoSuave}; font-size: 15px; margin: 0 0 24px 0;">
            <strong style="color: ${COLOR.textoOscuro};">${datos.cliente}</strong> reagendó su cita.
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLOR.cremaClara}; border-radius: 12px; margin-bottom: 20px;">
            <tr><td style="padding: 24px 26px;">
                <h3 style="margin: 0 0 16px 0; color: ${COLOR.textoOscuro}; font-size: 15px;">Cambios</h3>
                <p style="margin: 0 0 12px 0; color: ${COLOR.textoSuave}; font-size: 15px;">
                    <strong>Servicio:</strong> ${datos.servicio}
                </p>
                <p style="margin: 0 0 12px 0; color: ${COLOR.textoSuave}; font-size: 15px; text-decoration: line-through;">
                    <strong>Antes:</strong> ${fechaAnterior} a las ${horaAnterior}
                </p>
                <p style="margin: 0; color: ${COLOR.rosaOscuro}; font-size: 16px;">
                    <strong>Ahora:</strong> ${fechaNueva} a las ${horaNueva}
                </p>
            </td></tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLOR.crema}; border-radius: 12px;">
            <tr><td style="padding: 20px 26px;">
                <p style="color: ${COLOR.textoSuave}; margin: 0 0 6px 0; font-size: 14px;">
                    ✅ El evento en tu Google Calendar ya fue actualizado automáticamente.
                </p>
                <p style="color: ${COLOR.textoSuave}; margin: 0; font-size: 14px;">
                    ℹ️ Esta era su única posibilidad de reagendar. Si pide otro cambio, no será posible desde el sistema.
                </p>
            </td></tr>
        </table>
    `;

    return await transporter.sendMail({
        from: `"Sistema de Reservas" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `${datos.cliente} reagendó: ${fechaNueva} ${horaNueva}`,
        html: plantilla(contenido)
    });
}

module.exports = {
    enviarEmailClienta,
    enviarEmailFrancisca,
    enviarEmailResena,
    enviarEmailReagendamientoClienta,
    enviarEmailReagendamientoFrancisca
};