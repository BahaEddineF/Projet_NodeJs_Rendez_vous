require("./emailService");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express(); // Déclarer app en premier
app.use(cors()); // Pour éviter les erreurs CORS
app.use(express.json()); // Permet à Express de comprendre les JSON envoyés

// 📌 Importer et utiliser les routes des rendez-vous
const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/api/appointments", appointmentRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.log("❌ Erreur de connexion à MongoDB :", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
