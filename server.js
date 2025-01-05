const express = require('express');
const cors = require('cors');
const rateLimiter = require('./src/middlewares/rateLimiter')
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
    origin: '*', // This allows all origins
    methods: ['GET', 'POST'],
}));

// Import routes
const articleRoutes = require('./src/routes/articleRoutes');
const feedRoutes = require('./src/routes/feedRoutes');
const opmlRoutes = require('./src/routes/opmlRoutes');

// Apply rate limiter globally
app.use(rateLimiter)

// Use routes
app.use('/articles', articleRoutes);
app.use('/feeds', feedRoutes);
app.use('/opml', opmlRoutes);

// For cron-job
app.get('/', (req, res) => {
    res.send("Server is up and running.");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});