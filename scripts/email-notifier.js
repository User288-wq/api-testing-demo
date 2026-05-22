const nodemailer = require("nodemailer");
const fs = require("fs");

async function sendEmailWithReport() {
    try {
        // 1. Création d'un compte de test Ethereal
        const testAccount = await nodemailer.createTestAccount();
        console.log("✅ Compte Ethereal généré :", testAccount.user);

        // 2. Configuration du transporteur
        const transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        // 3. Lire le dernier rapport HTML généré par Newman
        const reportPath = "reports/dev-report.html";
        let attachments = [];

        if (fs.existsSync(reportPath)) {
            attachments.push({
                filename: "test-report.html",
                path: reportPath,
            });
            console.log("📄 Rapport chargé :", reportPath);
        } else {
            console.warn("⚠️ Rapport HTML introuvable :", reportPath);
        }

        // 4. Envoyer l'email avec le rapport en pièce jointe
        const info = await transporter.sendMail({
            from: `"User288-wq API Tests" <${testAccount.user}>`,
            to: "diaraf1993diouf@gmail.com",
            subject: `[API Tests] Résultats du ${new Date().toLocaleString()}`,
            html: `
                <h2>📊 Rapport des tests API</h2>
                <p>Les tests ont été exécutés avec succès.</p>
                <p>Consultez la pièce jointe pour le détail complet.</p>
                <hr />
                <p><small>Email généré automatiquement par GitHub Actions.</small></p>
            `,
            attachments: attachments,
        });

        // 5. Afficher l'URL de prévisualisation
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("✅ Email envoyé !");
        console.log("📧 Prévisualisation :", previewUrl);
        console.log("\n💡 Ouvrez ce lien dans votre navigateur pour voir le rapport.");
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi :", error.message);
        process.exit(1);
    }
}

sendEmailWithReport();
