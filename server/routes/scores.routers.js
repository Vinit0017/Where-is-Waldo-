const{Router} = require("express");
const router = Router();


router.post("/games/:gameId/score", saveScore);

router.get("/games/images/:imageId/scores", topScorers);

module.exports = router;