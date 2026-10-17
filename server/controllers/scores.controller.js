const { matchedData } = require("express-validator");
const gameQueries = require("../db/gameSession.db");
const scoreQueries = require("../db/scores.db");
const imageQueries = require("../db/images.db");
const CustomError = require("../middlewares/customErrors");
const { getPagination } = require("../services/gameServices");

exports.handleSaveScore = async(req, res, next) =>{
    try{
        const gameId = req.params.gameId;
        const gameData = await gameQueries.findGame(gameId);
        if(!gameData) throw new CustomError("Game not found!", 404, "GAME_NOT_FOUND");

        if(gameData.status !== "FINISHED") throw new CustomError("Game is not finished!", 409, "GAME_NOT_FINISHED");

        const scoreSubmitted = await scoreQueries.findScore(gameId);
        if(scoreSubmitted) throw new CustomError("Score is already submitted!", 409, "SCORE_ALREADY_SUBMITTED");

        const {playerName} = matchedData(req);
        const imageId = gameData.image.id;
        const durationMs = gameData.durationMs;

        const addedScore = await scoreQueries.addScore(gameId, imageId, playerName, durationMs);

        const playerRank = await scoreQueries.getRank(addedScore.id, imageId, durationMs,addedScore.createdAt);

        const currentSkip = 0;
        const leaderboardData = await scoreQueries.getAllScores(imageId, currentSkip, 10);

        const leaderboard = leaderboardData.map((s, i) =>{
                return{
                    rank: currentSkip + i + 1,
                    playerName: s.playerName,
                    durationMs: s.durationMs,
                }
            })
        
        const formatedData = {
            "score": {
                "id": addedScore.id,
                "playerName": addedScore.playerName,
                "durationMs": addedScore.durationMs,
            },
            "rank": playerRank,
            "leaderboard": leaderboard,
        }

        return res.status(201).json(formatedData);
    }catch(err){
        next(err);
    }
};

exports.handleTopScores = async(req, res, next) =>{
    try{
        const imageId = Number(req.params.imageId);
        if(!Number.isInteger(imageId)) throw new CustomError("Invalid image.", 404, "INVALID_IMAGE_ID");

        const image = await imageQueries.getImageDataById(imageId);
        if(!image) throw new CustomError("Invalid image id", 404, "IMAGE_NOT_FOUND");

        const {page, limit, skip} = getPagination(req.query);

        const leaderboardData = await scoreQueries.getAllScores(imageId, skip, limit);

        const leaderboard = leaderboardData.map((s, i) =>{
            return {
                rank: skip + i + 1,
                playerName: s.playerName,
                durationMs: s.durationMs,
                createdAt: s.createdAt,
            };
        });

        const formatedData = {
            "imageId": imageId,
            "scores": leaderboard
        };

        return res.status(200).json(formatedData);
    }catch(err){
        next(err);
    }
};