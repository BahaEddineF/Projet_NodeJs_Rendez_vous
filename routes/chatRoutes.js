const express = require('express');
const router = express.Router();

// Handle GET request (for testing)
router.get('/', (req, res) => {
    res.send("Welcome to the Chat API. Send a POST request with a message.");
});

// Handle POST request (chatbot logic)
router.post('/', (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    let botResponse = "I don't understand.";

    if (userMessage.toLowerCase().includes("hello")) {
        botResponse = "Hi there! How can I assist you?";
    } else if (userMessage.toLowerCase().includes("bye")) {
        botResponse = "Goodbye! Have a great day!";
    } else if (userMessage.toLowerCase().includes("how are you")) {
        botResponse = "I'm just a bot, but I'm doing great! Thanks for asking.";
    }

    res.json({ reply: botResponse });
});
module.exports = router;
