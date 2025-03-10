require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "yosrbouguerra040@gmail.com",
    subject: "Rappel",
    text: "Ceci est un e-mail de test envoyé depuis Node.js",
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error("Erreur lors de l'envoi :", error);
    } else {
        console.log("E-mail envoyé avec succès :", info.response);
    }
});
