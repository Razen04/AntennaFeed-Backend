const express = require('express');
require('dotenv').config();
const cors = require('cors');
const rateLimiter = require('./src/middlewares/rateLimiter')
const app = express();
const port = 5000;

app.use(express.json());


// Cors Policy
app.use(cors());


// Import routes
const articleRoutes = require('./src/routes/articleRoutes');
const feedRoutes = require('./src/routes/feedRoutes');
const opmlRoutes = require('./src/routes/opmlRoutes');
const { Callback } = require('puppeteer');

// Apply rate limiter globally
app.use(rateLimiter)

// Use routes
app.use('/articles', articleRoutes);
app.use('/feeds', feedRoutes);
app.use('/opml', opmlRoutes);

// For cron-job
app.get('/status', (req, res) => {
    res.send("Server is up and running.");
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});