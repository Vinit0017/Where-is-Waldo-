const CustomError = require("../middlewares/customErrors");
const gameQueries = require("../db/gameSession.db");
const characterQueries = require("../db/characters.db");
const foundQueries = require("../db/found.db");
const imageQueries = require("../db/images.db");
const { hitTest } = require("../services/hitTest");

async function checkGame(gameId) {
    const gameData = await gameQueries.findGame(gameId);
    if(!gameData) throw new CustomError("Game not found!", 404, "GAME_NOT_FOUND");

    return gameData;
}

exports.createGame = async (req, res, next) => {
    try{
        const imageId = req.body.imageId;
        if(!Number.isInteger(imageId)) throw new CustomError("Image is not found!", 400, "INVALID_IMAGE_ID");
        
        const image = await imageQueries.getImageDataById(imageId);
        if(!image){
            throw new CustomError("Image not found", 404, "IMAGE_NOT_FOUND");
        }
        const gameData = await gameQueries.createGame(imageId);

        const formatedData = {
            "gameId": gameData.id,
            "status": gameData.status,
            "imageId": gameData.imageId
        };

        return res.status(201).json(formatedData);
    }catch(err){
        next(err);
    }
};

exports.restoreGameState = async (req, res, next) =>{
    try{
        const gameId = req.params.gameId;

        const gameData = await checkGame(gameId);
        const remaining = gameData.image._count.characters - gameData.found.length;
        const formatedData = {
            "gameId": gameData.id,
            "imageId": gameData.image.id,
            "status": gameData.status,
            "startedAt": gameData.startedAt,
            "serverNow": new Date(),
            "found": gameData.found.map((char) =>({
                "characterId": char.character.id,
                "name": char.character.name,
                "box": {
                    "xMin": char.character.xMin,
                    "xMax": char.character.xMax,
                    "yMin": char.character.yMin,
                    "yMax": char.character.yMax,
                },
            })),
            "remaining": remaining,
            "durationMs": gameData.durationMs,
        }

        return res.status(200).json(formatedData);

    }catch(err){
        next(err);
    }
}

exports.startGame = async (req, res, next) =>{
    try{
        const gameId = req.params.gameId;
        const gameData = await checkGame(gameId);

        if(gameData.status === "FINISHED"){
            throw new CustomError("Game is already finished", 409, "GAME_ALREADY_FINISHED");
        }

        if(gameData.status === "PLAYING"){
            return res.status(200).json({
                "gameId": gameData.id,
                "status": gameData.status,
                "startedAt": gameData.startedAt,
            });
        }

        await gameQueries.setGameStart(gameId);
        const updatedData = await checkGame(gameId);
        const formatedData = {
            "gameId": updatedData.id,
            "status": updatedData.status,
            "startedAt": updatedData.startedAt,
        }

        return res.status(200).json(formatedData);
    }catch(err){
        next(err);
    }
};

exports.guessGame = async (req, res, next) => {
  try {
    const gameId = req.params.gameId;
    const { characterId, x, y } = req.body;

    const valid = Number.isInteger(characterId) && typeof x === "number" && typeof y === "number" && x >= 0 && x <= 1 && y >= 0 && y <= 1;
    if (!valid) throw new CustomError("Invalid input", 400, "INVALID_INPUT");

    const gameData = await checkGame(gameId);
    if (gameData.status !== "PLAYING") {
      throw new CustomError("Game is not in progress", 409, "GAME_NOT_PLAYING");
    }

    const character = await characterQueries.findCharacterByCharacterId(characterId);
    if (!character || character.imageId !== gameData.image.id) {
      throw new CustomError("Invalid Character!", 404, "INVALID_CHARACTER_SELECTION");
    }

    const total = gameData.image._count.characters;
    const base = {
      correct: true,
      character: { id: character.id, name: character.name },
      box: {
        xMin: character.xMin, xMax: character.xMax,
        yMin: character.yMin, yMax: character.yMax,
      },
    };

    if (await foundQueries.getCharacter(gameId, characterId)) {
      return res.status(200).json({
        ...base,
        remaining: total - gameData.found.length,
        finished: false,
      });
    }

    const image = await imageQueries.getImageDataById(gameData.image.id);
    if (!hitTest(image, character, x, y)) {
      return res.status(200).json({
        correct: false,
        message: `That's not ${character.name}. Keep looking.`,
      });
    }

    const progress = await gameQueries.runInTransaction(async (tx) => {
      await foundQueries.addFound(gameId, characterId, tx);

      const foundCount = await foundQueries.countFound(gameId, tx);
      const totalNow = await characterQueries.countCharacters(gameData.image.id, tx);

      if (foundCount !== totalNow) {
        return { finished: false, remaining: totalNow - foundCount };
      }

      const finishedAt = new Date();
      const durationMs = finishedAt.getTime() - gameData.startedAt.getTime();
      await gameQueries.finishGame(gameId, finishedAt, durationMs, tx);
      return { finished: true, remaining: 0, finishedAt, durationMs };
    });

    return res.status(200).json({ ...base, ...progress });
  } catch (err) {
    next(err);
  }
};