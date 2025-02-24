const cron = require("node-cron");
const fetch = require("node-fetch"); // Vérifie qu'il est installé !
require("dotenv").config();
const nodemailer = require("nodemailer");

// Configurer le transporteur SMTP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Mets ton e-mail
        pass: process.env.EMAIL_PASS, // Mets ton App Password si Gmail
    },
});

// Fonction pour envoyer un email
const sendReminderEmail = (email, nom, date, heure) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Rappel de votre rendez-vous",
        text: `Bonjour ${nom},\n\nCeci est un rappel pour votre rendez-vous prévu le ${date} à ${heure}.\n\nMerci !`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("❌ Erreur d'envoi d'email :", error);
        } else {
            console.log("✅ E-mail envoyé :", info.response);
        }
    });
};

// Tester l'envoi immédiat d'un email
sendReminderEmail("Yosrbouguerra040@gmail.com", "Test User", "2025-02-25", "14:00");

// Planifier un job qui tourne tous les jours à 08:00
cron.schedule("0 8 * * *", async () => {
    console.log("🔔 Vérification des rendez-vous pour rappel...");

    try {
        const response = await fetch("http://localhost:5000/api/appointments");
        const appointments = await response.json();

        const today = new Date();
        today.setDate(today.getDate() + 1); // Un jour avant le rendez-vous
        const reminderDate = today.toISOString().split("T")[0];

        appointments.forEach((appt) => {
            if (appt.date === reminderDate) {
                sendReminderEmail(appt.email, appt.nom, appt.date, appt.heure);
            }
        });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des rendez-vous :", error);
    }
});

console.log("📅 Planificateur de rappels activé !");
