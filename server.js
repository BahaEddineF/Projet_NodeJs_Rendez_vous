require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const Appointment = require('./models/Appointment');  
const app = express();
const path = require('path');  
app.use(express.static(path.join(__dirname, 'appointment-form')));
const doctors = [
    { name: "Dr. Alice Smith", specialty: "Generalist", category: "generalist" },
    { name: "Dr. Bob Johnson", specialty: "Generalist", category: "generalist" },
    { name: "Dr. Carol White", specialty: "Ophthalmologist", category: "ophthalmologist" },
    { name: "Dr. David Brown", specialty: "Ophthalmologist", category: "ophthalmologist" }
];
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/api/appointments', async (req, res) => {  
  try {
      const appointment = new Appointment(req.body);
      await appointment.save();  
      res.status(201).json(appointment);
  } catch (error) {
      console.error("Erreur MongoDB:", error.message);
      res.status(500).json({ error: error.message });
  }
});
// Route to get doctors 
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


app.post("/api/appointments", async (req, res) => {
  try {
    console.log('Received request body:', req.body);  
    if (!req.body) {
      return res.status(400).json({ error: "No data received in request body" });
    }
    const { email, category, doctor, appointmentDate } = req.body;
    if (!email || !category || !doctor || !appointmentDate) {
      return res.status(400).json({ error: "All fields are required." });
    }
console.log('Appointment successfully booked:', email, category, doctor, appointmentDate);
window.location.href = '/appointment-form/rendezvous.html';  
    res.status(200).json({ message: "Appointment booked successfully!" });
  } catch (error) {
    console.error('Error while booking appointment:', error);  
    res.status(500).json({ error: `An error occurred: ${error.message}` });  
  }
});
app.use(express.static(path.join(__dirname, 'appointment-form')));

app.get('/rendezvous.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'appointment-form', 'rendezvous.html')); });

app.get('/test', (req, res) => {
  res.send('Static files are working!');
});
app.post('/book-appointment', (req, res) => {
    try {
        const { email, category, doctor, appointmentDate } = req.body;
        console.log('Email:', email);
        console.log('Category:', category);
        console.log('Doctor:', doctor);
        console.log('Appointment Date:', appointmentDate);
        res.status(200).send('Appointment booked successfully');
        window.location.href = '/appointment-form/rendezvous.html';  

    } catch (error) {
        console.error('Error while booking appointment:', error);
        res.status(500).send('Error while booking appointment');
    }
});

app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find(); 
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Server error. Could not retrieve appointments." });
  }
});

app.use(express.static("public"));
app.use(cors({
    origin: "http://localhost:5000",  
    methods: ["GET", "POST"],
    credentials: true
}));
const chatRoutes = require("./routes/chatRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/chat", chatRoutes);
app.use("/api/appointments", appointmentRoutes);

app.post("/api/appointments", async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    if (!req.body) {
      return res.status(400).json({ error: "No data received in request body" });
    }

    const { email, category, doctor, appointmentDate } = req.body;

    if (!email || !category || !doctor || !appointmentDate) {
      return res.status(400).json({ error: "All fields are required." });
    }

    console.log('Appointment successfully booked:', email, category, doctor, appointmentDate);
    res.status(200).json({ message: "Appointment booked successfully!" });
  } catch (error) {
    console.error('Error while booking appointment:', error); 
    res.status(500).json({ error: "An error occurred while booking the appointment." });
  }
});

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// OpenAI API Key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/appointment-form/index.html");  
});

// Route to handle the form submission
app.post('/submit-appointment', (req, res) => {
    const { name, phone, email, date, time, area, city } = req.body;

    console.log('Appointment Details:', { name, phone, email, date, time, area, city });

    res.send(`
      <h2>Appointment Successfully Booked</h2>
      <p>Thank you, ${name}! Your appointment has been booked for ${date} at ${time}. We will contact you at ${phone} or ${email} for further details.</p>
      <a href="/">Go back to the homepage</a>
    `);
});

// Chatbot Route using OpenAI API
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    console.error("❌ Error: No message received!");
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    console.log("📨 Message received:", message);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }]
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ OpenAI response:", response.data);

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("❌ Error with OpenAI API:", error.response ? error.response.data : error.message);

    return res.status(500).json({
      error: "Failed to fetch chatbot response",
      details: error.response ? error.response.data : error.message
    });
  }
});
// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
      const appointments = await Appointment.find();  
      res.json(appointments);
  } catch (error) {
      res.status(500).json({ message: "Error fetching appointments" });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const deletedAppointment = await Appointment.findByIdAndDelete(id);
      
      if (!deletedAppointment) {
          return res.status(404).json({ message: 'Appointment not found' });
      }
      
      res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ message: 'Error deleting appointment' });
  }
});


async function editAppointment(id) {
  try {
      const response = await axios.get(`http://localhost:5000/api/appointments/${id}`);
      const appointment = response.data;

      // Remplir le formulaire avec les détails actuels
      document.getElementById('updateEmail').value = appointment.email;
      document.getElementById('updateDoctor').value = appointment.doctor;
      document.getElementById('updateAppointmentDate').value = appointment.appointmentDate;

      // Afficher le formulaire de modification
      document.getElementById('modifyForm').classList.remove('hidden');

      // Soumettre le formulaire pour mettre à jour l'appointment
      const updateForm = document.getElementById('updateAppointmentForm');
      updateForm.onsubmit = async (event) => {
          event.preventDefault();

          const updatedAppointment = {
              email: document.getElementById('updateEmail').value,
              doctor: document.getElementById('updateDoctor').value,
              appointmentDate: document.getElementById('updateAppointmentDate').value
          };

          try {
              await axios.put(`http://localhost:5000/api/appointments/${id}`, updatedAppointment);
              fetchAppointments(); // Rafraîchir la liste après modification
              document.getElementById('modifyForm').classList.add('hidden'); // Cacher le formulaire
          } catch (error) {
              console.error("Error updating appointment:", error.response ? error.response.data : error);
          }
      };
  } catch (error) {
      console.error("Error fetching appointment data:", error.response ? error.response.data : error);
  }
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
