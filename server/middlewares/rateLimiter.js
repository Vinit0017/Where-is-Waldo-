const rateLimit = require("express-rate-limit");

const guessLimiter = rateLimit({
    windowMs: 1 * 1000,//1 second 
    max: 2,//120 attempts allowed in one minute
    message: 'Too fast!',
});

module.exports = guessLimiter;