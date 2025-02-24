const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment"); // Importer le modèle

// Récupérer tous les rendez-vous
router.get("/", async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

//  Ajouter un rendez-vous
router.post("/", async (req, res) => {
    try {
        const { date, heure, nom, email, motif } = req.body;
        const newAppointment = new Appointment({ date, heure, nom, email, motif });
        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de l'ajout", error });
    }
});

/// Modifier un rendez-vous
router.put("/:id", async (req, res) => {
    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Retourne les nouvelles données mises à jour
        );
        res.json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la modification" });
    }
});

//  Supprimer un rendez-vous
router.delete("/:id", async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: "Rendez-vous supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error });
    }
});


module.exports = router;
