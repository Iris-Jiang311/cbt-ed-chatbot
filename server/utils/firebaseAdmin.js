// utils/firebaseAdmin.js
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let rawKey = process.env.FIREBASE_PRIVATE_KEY;
if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1);
const cleanPrivateKey = rawKey.replace(/\\n/g, '\n');

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: cleanPrivateKey,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
};

const tempPath = path.join(__dirname, "../tmp");
if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
const keyPath = path.join(tempPath, "firebase-key.json");
fs.writeFileSync(keyPath, JSON.stringify(serviceAccount, null, 2));

admin.initializeApp({
  credential: admin.credential.cert(require(keyPath))
});

module.exports = admin;
