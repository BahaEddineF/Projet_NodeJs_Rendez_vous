const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    date: { type: String, required: true },
    heure: { type: String, required: true }, // Change de Date à String
    nom: { type: String, required: true },
    email: { type: String, required: true },
    motif: { type: String, required: true }
});
  

module.exports = mongoose.model("Appointment", appointmentSchema);
