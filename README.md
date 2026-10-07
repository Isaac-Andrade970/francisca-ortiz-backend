# Francisca Ortiz Backend ⚙️

API del sistema de reservas y tienda de **Francisca Ortiz Peluquería y Manicure**. Da soporte al [sitio web](https://github.com/Isaac-Andrade970/francisca-ortiz-studio) ([franciscaortizstudio.cl](https://franciscaortizstudio.cl/)).

## Qué hace

- Gestiona **reservas** y las sincroniza con **Google Calendar**
- **Autenticación** del panel de administración (contraseñas con bcrypt y sesiones con JWT)
- Guarda servicios, productos y reseñas en **Firebase**
- Envía **correos automáticos** de confirmación con Resend
- Ejecuta **tareas programadas** (por ejemplo, recordatorios) con node-cron

## Tecnologías

Node.js 20 · Express · Firebase Admin · Google APIs · JWT · bcrypt · Resend · node-cron

Desplegado en Render.

## Cómo ejecutarlo

```bash
npm install
npm start
```

Necesita un archivo `.env` con las credenciales de Firebase, Google Calendar, JWT y Resend (no se incluye en el repositorio).

## Autor

Isaac Andrade · [LinkedIn](https://www.linkedin.com/in/isaac-andrade-6652142b1/) · [GitHub](https://github.com/Isaac-Andrade970)
