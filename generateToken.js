const jwt = require("jsonwebtoken");

// Clé secrète (assure-toi qu'elle correspond à celle utilisée dans ton backend)
const secretKey = "yosrsecretkey";

// Payload du token
const payload = {
    email: "Yosrbouguerra040.com"
};

// Génération du JWT avec expiration d'1 heure
const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

console.log("Generated JWT Token:");
console.log(token);
