const nodemailer = require("nodemailer");
const fs = require("fs");

async function sendEmailWithReport() {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
    });

    const reportPath = "reports/dev-report.html";
    let attachments = [];
    if (fs.existsSync(reportPath)) {
        attachments.push({ filename: "test-report.html", path: reportPath });
        console.log("📄 Rapport chargé");
    }

    const info = await transporter.sendMail({
        from: `"User288-wq" <${testAccount.user}>`,
        to: "diaraf1993diouf@gmail.com",
        subject: `[API Tests] ${new Date().toLocaleString()}`,
        html: "<h2>Tests exécutés</h2><p>Rapport en pièce jointe.</p>",
        attachments
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("✅ Email généré :", previewUrl);
}

sendEmailWithReport();
