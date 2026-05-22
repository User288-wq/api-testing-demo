const sgMail = require('@sendgrid/mail');

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
    console.error("❌ Définissez SENDGRID_API_KEY dans l'environnement");
    process.exit(1);
}

sgMail.setApiKey(apiKey);

sgMail.send({
    to: process.env.EMAIL_TO || "diaraf1993diouf@gmail.com",
    from: "diaraf1993diouf@gmail.com",   // votre email validé chez SendGrid
    subject: "Test depuis SendGrid",
    text: "L'envoi fonctionne !"
})
.then(() => console.log("✅ Email envoyé via SendGrid"))
.catch(err => console.error("❌ Erreur SendGrid :", err.response?.body || err));
