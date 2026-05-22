const nodemailer = require('nodemailer');
const fs = require('fs');

async function sendEmail() {
    // Configuration Gmail (utilise les variables d'environnement)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD   // mot de passe d'application
        }
    });

    // Lire le dernier rapport HTML
    let reportHtml = '';
    const reportPath = 'reports/dev-report.html';
    if (fs.existsSync(reportPath)) {
        reportHtml = fs.readFileSync(reportPath, 'utf8');
    }

    const mailOptions = {
        from: `"User288-wq API Tests" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_RECIPIENTS,
        subject: `[API Tests] Résultats du ${new Date().toLocaleString()}`,
        html: `
            <h2>Résultats des tests API</h2>
            <p>Les tests se sont déroulés avec succès.</p>
            <p>Consultez le rapport complet en pièce jointe.</p>
            <hr />
            <pre>${reportHtml.substring(0, 500)}...</pre>
        `,
        attachments: [
            {
                filename: 'test-report.html',
                path: reportPath
            }
        ]
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('✅ Email envoyé :', info.messageId);
    } catch (error) {
        console.error('❌ Erreur envoi email :', error.message);
    }
}

sendEmail();
