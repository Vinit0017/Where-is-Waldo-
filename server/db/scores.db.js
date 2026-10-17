const prisma = require("../config/prisma")

exports.findScore = async (gameId) =>{
    return prisma.score.findUnique({
        where: {sessionId: gameId},
        select: {
            id: true,
            sessionId: true,
            imageId: true,
            playerName: true,
            durationMs: true,
            createdAt: true
        },
    });
};

exports.addScore = async (gameId, imageId, playerName, durationMs) =>{
    return prisma.score.create({
        data: {
            sessionId: gameId,
            imageId: imageId,
            playerName: playerName,
            durationMs: durationMs
        },
        select: {
            id: true,
            sessionId: true,
            imageId: true,
            playerName: true,
            durationMs: true,
            createdAt: true,
        }
    });
};

exports.getAllScores = async (imageId, skip, limit) =>{
    return prisma.score.findMany({
        where: {imageId: imageId},
        select: {
            id: true,
            sessionId: true,
            imageId: true,
            playerName: true,
            durationMs: true,
            createdAt: true,
        },
        orderBy: {durationMs: "asc"},
        skip,
        take: limit,
    });
};

exports.getRank = async (scoreId, imageId, durationMs, createdAt) =>{
    const rank = await prisma.score.count({
        where: {
            imageId: imageId,
            OR: [
                {durationMs: {lt: durationMs}},
                {
                    durationMs: durationMs,
                    createdAt: {lt: createdAt},
                },
            ]
        },
    });
    return rank + 1;
};