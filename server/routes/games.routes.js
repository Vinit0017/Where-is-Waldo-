const {Router}= require("express");
const router = Router();


router.post("/games", createGame);

router.get("/games/:gameId", restoreGameState);

router.post("/games/:gameId/start", startGame);

router.post("/games/:gameId/guess", guessFound);

module.exports = router;