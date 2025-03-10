const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    specialization: { 
        type: String, 
        enum: ["Ophtalmologue", "Généraliste"], 
        required: true 
    }
});

const Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor;
