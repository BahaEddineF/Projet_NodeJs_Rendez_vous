const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
app.use(express.json()); 

require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
    },
});

// Route pour enregistrer un rendez-vous et envoyer un e-mail
app.post("/api/appointments", (req, res) => {
    const { email, category, doctor, appointmentDate } = req.body;

    sendReminderEmail(email, category, doctor, appointmentDate);

    res.status(201).json({ message: "Rendez-vous ajouté et email envoyé" });
});

// Fonction pour envoyer l'e-mail de rappel
const sendReminderEmail = (email, category, doctor, appointmentDate) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,  
        to: email, 
        subject: "Rappel de votre rendez-vous",
        text: `Bonjour,\n\nVous avez un rendez-vous avec un ${category} ${doctor ? "Dr. " + doctor : ""} prévu le ${appointmentDate}.\n\nMerci de votre confiance !`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Erreur lors de l'envoi de l'email :", error);
        } else {
            console.log("Email envoyé à :", email);
            console.log("Réponse du serveur :", info.response);
        }
    });
};

app.listen(5000, () => {
    console.log("Serveur en écoute sur le port 5000");
});
