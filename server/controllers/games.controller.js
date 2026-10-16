const CustomError = require("../middlewares/customErrors");
const gameQueries = require("../db/gameSession.db");
const characterQueries = require("../db/characters.db");
const foundQueries = require("../db/found.db");
const imageQueries = require("../db/images.db");
const { hitTest } = require("../services/hitTest");

async function checkGame(gameId) {
    const gameData = await gameQueries.findGame(gameId);
    if(!gameData) throw new CustomError("Game not found!", 404, "GAME_NOT_FOUND");

    if(gameData.status === "FINISHED"){
        throw new CustomError("Game is already finished", 409, "GAME_ALREADY_FINISHED");
    }

    return gameData;
}

exports.createGame = async (req, res, next) => {
    try{
        const imageId = req.body.imageId;
        if(!Number.isInteger(imageId)) throw new CustomError("Image is not found!", 400, "INVALID_IMAGE_ID");
        
        const image = imageQueries.getImageDataById(imageId);
        if(!image){
            throw new CustomError("Image not found", 404, "IMAGE_NOT_FOUND");
        }
        const gameData = await gameQueries.createGame(imageId);

        formatedData = {
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
                "characterId": char.id,
                "name": char.name,
                "box": {
                    "xMin": char.xMin,
                    "xMax": char.xMax,
                    "yMin": char.yMin,
                    "yMax": char.yMax,
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

exports.guessGame = async (req, res, next) =>{
    try{
        const gameId = req.params.gameId;
        const {characterId, x, y} = req.body;
        
        const gameData = await checkGame(gameId);
        const character = await characterQueries.findCharacterByCharacterId(characterId);
        const remaining = gameData.image._count.characters - gameData.found.length;
        let formatedData = {
                "correct": true,
                "character": { "id": character.id, "name": character.name},
                "box": {"xMin": character.xMin, "xMax": character.xMax, "yMin": character.yMin, "yMax": character.yMax},
                "remaining": remaining,
                "finished": false,
            }

        if(character.imageId !== gameData.image.id) throw new CustomError("Invalid Character!", 404, "INVALID_CHARACTER_SELECTION");

        const existing = await foundQueries.getCharacter(gameId, characterId);
        if(existing){
            return res.status(200).json(formatedData);
        } 

        const image = await imageQueries.getImageDataById(gameData.image.id);

        const hit = hitTest(image, character, x, y);

        if(!hit){
            return res.status(200).json({
                "correct": false,
                "message": `That's not ${character.name}. Keep looking.`
            });
        }

        await gameQueries.runInTransaction(async(tx) =>{
            await foundQueries.addFound(gameId, characterId, tx);

            const foundCount = await foundQueries.countFound(gameId, tx);
            const total = await characterQueries.countCharacters(image.id);

            if(foundCount !== total){
                formatedData = {...formatedData, "remaining": foundCount};
                return res.status(200).json(formatedData);
            }

            const finishedAt = new Date();
            const durationMs = finishedAt.getTime() - gameData.startedAt.getTime();
            await gameQueries.finishGame(gameId, finishedAt, durationMs, tx);
            formatedData = {...formatedData, "finishedAt": finishedAt, "durationMs": durationMs, "finished": true, "remaining": 0};
            return res.status(200).json(formatedData);
        });

    }catch(err){
        next(err);
    }
}
