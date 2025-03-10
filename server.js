require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Appointment = require('./models/Appointment');
const User = require('./models/User'); // Add the User model
const app = express();
const path = require('path');
const Doctor = require("./models/Doctor"); // Vérifie que ce fichier existe
const Worker = require("./models/worker"); 
// Static file serving
app.use(express.static(path.join(__dirname, 'appointment-form')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const doctors = [
    { name: "Dr. Alice Smith", specialty: "Generalist", category: "generalist" },
    { name: "Dr. Bob Johnson", specialty: "Generalist", category: "generalist" },
    { name: "Dr. Carol White", specialty: "Ophthalmologist", category: "ophthalmologist" },
    { name: "Dr. David Brown", specialty: "Ophthalmologist", category: "ophthalmologist" }
];

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

// Appointment Routes

// Get a specific appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
  const appointmentId = req.params.id;
  try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
          return res.status(404).json({ message: 'Appointment not found' });
      }
      res.json(appointment);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching appointment data' });
  }
});

// Get doctors by category
app.get("/api/doctors", (req, res) => {
    const { category } = req.query;

    if (!category) {
        return res.status(400).json({ error: "Category is required" });
    }

    const filteredDoctors = doctors.filter(doctor => doctor.category === category);
    if (filteredDoctors.length > 0) {
        res.status(200).json(filteredDoctors);
    } else {
        res.status(404).json({ message: "No doctors found for this category" });
    }
});

// Create an appointment and send confirmation email
app.post('/api/appointments', async (req, res) => {
  const { email, doctor, appointmentDate, category } = req.body;

  // Check for required fields
  if (!email || !doctor || !appointmentDate || !category) {
    return res.status(400).send('Missing required fields');
  }

  try {
    // Create the appointment and save it
    const appointment = new Appointment({ email, doctor, appointmentDate, category });
    await appointment.save();

    // Send the confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmation de votre rendez-vous',
      text: `
        Bonjour ${email},
        Votre rendez-vous a été réservé avec succès pour le docteur ${doctor}.
        Date : ${appointmentDate}
        Catégorie : ${category}
        Merci et à bientôt !
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Erreur lors de l\'envoi de l\'email:', error);
        return res.status(500).json({ message: 'Error sending email.' });
      }

      console.log('Email envoyé:', info.response);
      return res.status(200).json({ message: 'Appointment booked successfully, and confirmation email sent!' });
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return res.status(500).json({ message: 'Error booking appointment.' });
  }
});

// Get all appointments
app.get("/api/appointments", async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ error: "Server error. Could not retrieve appointments." });
    }
});

// Delete an appointment by ID
app.delete('/api/appointments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(id);
        if (!deletedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
//edit 
app.put('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { doctor, email, appointmentDate } = req.body;

  if (!doctor || !email || !appointmentDate) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate appointment date (basic check)
  const date = new Date(appointmentDate);
  if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid appointment date' });
  }

  try {
      // Find and update the appointment
      const updatedAppointment = await Appointment.findByIdAndUpdate(
          id,
          { doctorName: doctor, email, appointmentDate },
          { new: true } // Return the updated document
      );

      if (!updatedAppointment) {
          return res.status(404).json({ message: 'Appointment not found' });
      }

      res.status(200).json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
  } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "Mot de passe incorrect" });
      }

      const token = jwt.sign({ userId: user._id }, "secretkey", { expiresIn: '1h' });
      res.json({ token });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur de connexion" });
  }
});

// Protected route 
app.get("/protected", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({ message: "Protected data", user: decoded });
  } catch {
      res.status(403).json({ error: "Invalid token" });
  }
});

// Home route to serve static files
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/appointment-form/index.html");
});
//baha 
let users = [];
// API to add a user (Doctor or Worker)
app.post("/addUser", async (req, res) => {
    const { name, email, role, specialization, jobTitle } = req.body;

    try {
        if (role === "doctor") {
            const newDoctor = new Doctor({ name, email, specialization });
            await newDoctor.save();
            res.status(201).json({ message: "Doctor added successfully", newDoctor });
        } else if (role === "worker") {
            const newWorker = new Worker({ name, email, jobTitle });
            await newWorker.save();
            res.status(201).json({ message: "Worker added successfully", newWorker });
        } else {
            res.status(400).json({ message: "Invalid role" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// API to get all users
app.get("/getUsers", async (req, res) => {
    try {
        const doctors = await Doctor.find();
        const workers = await Worker.find();
        console.log("Doctors:", doctors);
        console.log("Workers:", workers);
        res.json({ doctors, workers });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// API to update a user (Doctor or Worker)
app.put("/updateUser/:id", async (req, res) => {
    const { name, email, role, specialization, jobTitle } = req.body;

    try {
        if (role === "doctor") {
            const updatedDoctor = await Doctor.findByIdAndUpdate(
                req.params.id,
                { name, email, specialization },
                { new: true }
            );
            res.status(200).json({ message: "Doctor updated successfully", updatedDoctor });
        } else if (role === "worker") {
            const updatedWorker = await Worker.findByIdAndUpdate(
                req.params.id,
                { name, email, jobTitle },
                { new: true }
            );
            res.status(200).json({ message: "Worker updated successfully", updatedWorker });
        } else {
            res.status(400).json({ message: "Invalid role" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// API to delete a user (Doctor or Worker)
app.delete("/deleteUser/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        const worker = await Worker.findByIdAndDelete(req.params.id);

        if (doctor) {
            res.status(200).json({ message: "Doctor deleted successfully" });
        } else if (worker) {
            res.status(200).json({ message: "Worker deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
