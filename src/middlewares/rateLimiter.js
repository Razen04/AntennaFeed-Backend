const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 1*60*1000,
    max: 10,
    message: 'Too many requests from this IP, please try again after sometime.'
});

module.exports = limiter;