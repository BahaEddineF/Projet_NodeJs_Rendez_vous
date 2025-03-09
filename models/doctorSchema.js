const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: String,
  category: {
    type: String,
    enum: ["generalist", "ophthalmologist"], // Two categories of doctors
    required: true
  },
  specialty: String,
  email: String,
  phone: String
});

module.exports = mongoose.model("Doctor", doctorSchema);
