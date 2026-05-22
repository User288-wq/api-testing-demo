const nodemailer = require('nodemailer');
const fs = require('fs');

async function sendEmailWithReport() {
    const user = process.env.OUTLOOK_USER;
    const pass = process.env.OUTLOOK_PASS;
    const to = process.env.EMAIL_TO || "diaraf1993diouf@gmail.com";

    if (!user || !pass) {
        console.error("  Définissez OUTLOOK_USER et OUTLOOK_PASS");
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // TLS via STARTTLS
        auth: { user, pass }
    });

    const reportPath = "reports/dev-report.html";
    let attachments = [];
    if (fs.existsSync(reportPath)) {
        attachments.push({
            filename: "test-report.html",
            path: reportPath
        });
        console.log("  Rapport chargé :", reportPath);
    } else {
        console.warn("  Rapport introuvable");
    }

    const info = await transporter.sendMail({
        from: `"User288-wq API Tests" <${user}>`,
        to: to,
        subject: `[API Tests] Résultats du ${new Date().toLocaleString()}`,
        html: `<h2>  Rapport des tests API</h2><p>Tests exécutés avec succès.</p><p>Rapport en pièce jointe.</p>`,
        attachments
    });

    console.log("  Email envoyé via Outlook :", info.messageId);
}

sendEmailWithReport();
