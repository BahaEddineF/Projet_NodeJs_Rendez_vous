const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // Pour le hachage du mot de passe

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,  // email validation regex
    },
    password: {
        type: String,
        required: true,  // Ajout du mot de passe
    },
    loginAt: { type: Date, default: Date.now }
});

// Middleware pour hacher le mot de passe avant de sauvegarder
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);  // Hachage du mot de passe
    }
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
