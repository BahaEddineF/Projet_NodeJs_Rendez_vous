// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');  // Import your Appointment model

// Endpoint to get all appointments
router.get('/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Endpoint to book an appointment (change route to 'bookappointment')
router.post('/api/bookappointment', async (req, res) => {
    try {
        const { doctor, email, appointmentDate } = req.body;

        if (!doctor || !email || !appointmentDate) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newAppointment = new Appointment({
            doctorName: doctor,
            email,
            appointmentDate
        });

        await newAppointment.save();
        res.status(201).json({ message: "Appointment booked successfully", appointment: newAppointment });
    } catch (error) {
        console.error("Error booking appointment:", error);  // Log the error to the console
        res.status(500).json({ error: "Failed to book appointment", details: error.message });
    }
});

// Export the router to use in other files
module.exports = router;
