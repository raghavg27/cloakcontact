// Imports
const express = require('express');

// Import modular routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const qrRoutes = require('./routes/qrRoutes');
const contactRoutes = require('./routes/contactRequestRoutes');

// Initialisations
const app = express();

// Configuration
const PORT = 8080;

// Middleware
app.use(express.json());

// Routes

// Root
app.get("/", (req, res) => {
    res.status(200).send({
        "hollow": "world"
    })
});

// Use routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/qr', qrRoutes);
app.use("/contact", contactRoutes);



// Deploy`
app.listen(PORT, () => {
    console.log(`App running on port: ${PORT}`);
})