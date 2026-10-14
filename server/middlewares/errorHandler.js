const {
    PrismaClientKnownRequestError,
    PrismaClientValidationError,
} = require("../generated/prisma");

function errorHandler(err, req, res, next){
    console.log(err);

    if(err instanceof PrismaClientValidationError){
        return res
            .status(400)
            .json({
                error: {
                    code: "INVALID_QUERY",
                    message: "Invalid query parameters provied.",
                }
            })
    }


    return res.status(err.statusCode || 500).json({
        error: {
            code: err.code || "SERVER_ERROR",
            message: err.message || "Internal Server Error. Please try again later."
        }
    });
};

module.exports = errorHandler;