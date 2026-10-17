const {body} = require("express-validator");

exports.usernameValidator = [
    body("playerName")
        .trim()
        .notEmpty().withMessage("Username is required!")
        .isLength({ min: 1, max: 20 }).withMessage("Username must be 1 to 20 characters")
]