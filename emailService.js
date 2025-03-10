const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
app.use(express.json()); // Pour parser le corps des requêtes en JSON

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
const sendReminderEmail = (email, category, doctor, appointmentDate) => {
    // Formatage de la date pour un affichage plus lisible
    const formattedDate = new Date(appointmentDate).toLocaleString("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric", 
        hour: "2-digit", minute: "2-digit"
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,  
        to: email, 
        subject: "Rappel de votre rendez-vous",
        text: `Bonjour,\n\nVous avez un rendez-vous avec un ${category} ${doctor ? "Dr. " + doctor : ""} prévu le ${formattedDate}.\n\nMerci de votre confiance !\n\nCordialement, votre clinique.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Erreur lors de l'envoi de l'email :", error);
        } else {
            console.log("Email de rappel envoyé avec succès à :", email);
            console.log("Détails :", info.response);
        }
    });
};


// Lancer le serveur
app.listen(5000, () => {
    console.log("Serveur en écoute sur le port 5000");
});
