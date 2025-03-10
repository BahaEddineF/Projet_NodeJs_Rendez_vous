require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views')); // Serve static files (HTML, CSS)

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes

// Home Route (Dashboard)
app.get('/', async (req, res) => {
  try {
    const doctorsCount = await User.countDocuments({ role: 'doctor' });
    const secretariesCount = await User.countDocuments({ role: 'secretary' });
    res.sendFile(__dirname + '/views/index.html');
  } catch (err) {
    console.error('Error fetching counts:', err);
    res.status(500).send('Server Error');
  }
});

// Get all users (API)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server Error');
  }
});

// Get user by ID (API)
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Server Error');
  }
});

// Add User
app.post('/add-user', async (req, res) => {
  const { name, email, role } = req.body;
  try {
    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already exists');
    }

    // Create and save the new user
    const newUser = new User({ name, email, role });
    await newUser.save();
    res.redirect('/');
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).send('Error adding user: ' + err.message);
  }
});

// Edit User
app.post('/edit-user/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, { name, email, role }, { new: true, runValidators: true });
    if (!updatedUser) {
      return res.status(404).send('User not found');
    }
    res.redirect('/');
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Error updating user: ' + err.message);
  }
});

// Delete User
app.post('/delete-user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).send('User not found');
    }
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Error deleting user: ' + err.message);
  }
});

// Get stats (counts)
app.get('/api/stats', async (req, res) => {
  try {
    const doctorsCount = await User.countDocuments({ role: 'doctor' });
    const secretariesCount = await User.countDocuments({ role: 'secretary' });
    res.json({ doctorsCount, secretariesCount });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).send('Server Error');
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});