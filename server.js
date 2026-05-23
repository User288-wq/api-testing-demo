const express = require('express');
const app = express();
const port = 3000;

// Middleware de vérification de la clé API (commenté pour les tests)
/*
const apiKey = 'ma_cle_super_secrete';
app.use((req, res, next) => {
    const clientKey = req.headers['x-api-key'];
    if (!clientKey || clientKey !== apiKey) {
        return res.status(401).json({ error: 'Clé API invalide ou manquante' });
    }
    next();
});
*/

let posts = [ /* ... */ ];
// ... reste du code inchangé ...
