require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Appointment = require('./models/Appointment');
const app = express();
const path = require('path');

// Static folder setup
app.use(express.static(path.join(__dirname, 'appointment-form')));

// Example doctors list
const doctors = [
    { name: "Dr. Alice Smith", specialty: "Generalist", category: "generalist" },
    { name: "Dr. Bob Johnson", specialty: "Generalist", category: "generalist" },
    { name: "Dr. Carol White", specialty: "Ophthalmologist", category: "ophthalmologist" },
    { name: "Dr. David Brown", specialty: "Ophthalmologist", category: "ophthalmologist" }
];

// User storage (use DB in production)
const users = [];

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//partie jiged
// 📌 Enregistrement d'un nouvel utilisateur (Signup)
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    // Hash password and store user
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    res.status(201).json({ message: "Utilisateur enregistré avec succès" });
});
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Simulate a database check for the username and password
  if (username === 'admin' && password === 'password123') {
      res.json({ success: true, message: 'Login successful' });
  } else {
      res.json({ success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' });
  }
});
app.post('/api/register', async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // Simple validation
  if (!fullname || !email || !username || !password) {
      return res.json({ success: false, message: 'Tous les champs sont obligatoires.' });
  }

  // Check if username already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
      return res.json({ success: false, message: 'Nom d\'utilisateur déjà pris.' });
  }

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the user to the "database"
  users.push({
      fullname,
      email,
      username,
      password: hashedPassword
  });

  res.json({ success: true, message: 'Inscription réussie.' });
});
// 📌 Connexion (Login) et génération du JWT
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find((user) => user.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // Generate JWT
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    res.json({ token });
});
//jihed end 
// 📌 Middleware pour protéger les routes
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "Accès refusé" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token invalide" });
    }
};
//jihed
// 📌 Route protégée (nécessite un token JWT)
app.get("/protected", verifyToken, (req, res) => {
    res.json({ message: "Accès autorisé", user: req.user });
});

// 📌 Appointment Routes

// Route to get doctors by category
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

// Route to handle appointments
app.post("/api/appointments", async (req, res) => {
    try {
        const { email, category, doctor, appointmentDate } = req.body;

        // Validate appointment data
        if (!email || !category || !doctor || !appointmentDate) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const appointment = new Appointment({
            email,
            category,
            doctor,
            appointmentDate
        });
        await appointment.save();
        
        // Schedule email reminder for 24 hours before the appointment
        scheduleReminder(appointment);

        res.status(201).json({ message: "Appointment booked successfully!" });
    } catch (error) {
        console.error('Error while booking appointment:', error);
        res.status(500).json({ error: "An error occurred while booking the appointment." });
    }
});

// Route to get all appointments
app.get("/api/appointments", async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ error: "Server error. Could not retrieve appointments." });
    }
});

// Route to delete an appointment
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

// Route to send reminder email for appointments
function scheduleReminder(appointment) {
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const reminderTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before

    const timeToSendReminder = reminderTime.getTime() - now.getTime();

    if (timeToSendReminder > 0) {
        setTimeout(() => {
            sendReminderEmail(appointment.email, appointment.category, appointment.doctor, appointment.appointmentDate);
        }, timeToSendReminder);
    }
}

// Function to send email reminder
const sendReminderEmail = (email, category, doctor, appointmentDate) => {
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
            console.log("Email de rappel envoyé à :", email);
        }
    });
};

// Transporter for sending emails using Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Home route to serve static files
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/appointment-form/index.html");
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
