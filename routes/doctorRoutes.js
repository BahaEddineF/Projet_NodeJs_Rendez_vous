const express = require('express');
const Doctor = require('../models/doctorSchema');

const router = express.Router();

// Route to fetch doctors based on category
router.get('/', (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  Doctor.find({ category: category })
    .then((doctors) => {
      if (doctors.length > 0) {
        res.status(200).json(doctors);
      } else {
        res.status(404).json({ message: "No doctors found for this category" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Error fetching doctors", details: error.message });
    });
});

module.exports = router;
