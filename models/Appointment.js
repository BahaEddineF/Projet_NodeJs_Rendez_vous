const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  category: { type: String, required: true },
  doctor: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
