const{Router} = require("express");
const { usernameValidator } = require("../middlewares/validators");
const validateRequest = require("../middlewares/validateRequests");
const scoresController = require("../controllers/scores.controller");
const router = Router();


router.post("/games/:gameId/score", usernameValidator, validateRequest, scoresController.handleSaveScore);

router.get("/games/images/:imageId/scores", scoresController.handleTopScores);

module.exports = router;