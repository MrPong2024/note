const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

// Main route - serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to generate random number
app.post('/api/random', (req, res) => {
    const { min = 1, max = 100 } = req.body;
    
    // Validate input
    if (min >= max) {
        return res.status(400).json({ 
            error: 'Minimum value must be less than maximum value' 
        });
    }
    
    // Generate random number
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    
    res.json({ 
        number: randomNumber,
        min: min,
        max: max,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎲 Random Number Generator Server running on http://localhost:${PORT}`);
});

module.exports = app;