const {validationResult} = require("express-validator");
const CustomError = require("./customErrors");

function validateRequest (req, res, next){
    try{
        const result = validationResult(req);
    
        if (!result.isEmpty()) {
            const details = result.array().map((e) => ({
                field: e.path,
                location: e.location,
                message: e.msg,
                received: e.value,
            }));
            const err = new CustomError(details[0].message, 400, "VALIDATION_ERROR");
            return next(err);
        }
        next();
    }catch(err){
        next(err);
    }
}

module.exports = validateRequest;