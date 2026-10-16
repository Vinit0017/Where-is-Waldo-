const {Router}= require("express");
const router = Router();

const gameController = require("../controllers/games.controller");

router.post("/games", gameController.createGame);

router.get("/games/:gameId", gameController.restoreGameState);

router.post("/games/:gameId/start", gameController.startGame);

router.post("/games/:gameId/guess", gameController.guessGame);

module.exports = router;