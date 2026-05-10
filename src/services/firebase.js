// SERVICIO DE FIREBASE FIRESTORE \\

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

if (!process.env.FIREBASE_CREDENTIALS_PATH) {
    throw new Error('Falta FIREBASE_CREDENTIALS_PATH en el archivo .env');
}

// Cargar las credenciales desde el JSON
const credentialsPath = path.resolve(process.env.FIREBASE_CREDENTIALS_PATH);
const serviceAccount = require(credentialsPath);

// Inicializar Firebase Admin SDK (solo si no está ya inicializado)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Obtener instancia de Firestore
const db = admin.firestore();

module.exports = db;