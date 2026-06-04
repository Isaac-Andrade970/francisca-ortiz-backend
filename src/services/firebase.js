// SERVICIO DE FIREBASE FIRESTORE \\

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let serviceAccount;

if (process.env.FIREBASE_CREDENTIALS_JSON) {
    // PRODUCCIÓN (Render): credenciales como variable de entorno (JSON en texto)
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
} else if (process.env.FIREBASE_CREDENTIALS_PATH) {
    // LOCAL: credenciales desde el archivo
    const credentialsPath = path.resolve(process.env.FIREBASE_CREDENTIALS_PATH);
    serviceAccount = require(credentialsPath);
} else {
    throw new Error('Faltan credenciales de Firebase (ni FIREBASE_CREDENTIALS_JSON ni FIREBASE_CREDENTIALS_PATH)');
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

module.exports = db;