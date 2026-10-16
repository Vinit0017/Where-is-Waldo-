const prisma = require("../config/prisma")

exports.createGame = async (imageId) => {
    return prisma.gameSession.create({
        data: {
            imageId: imageId,
        },
        select: {
            id: true,
            imageId: true,
            status: true,
        }
    })
};


exports.findGame = async(gameId) =>{
    return prisma.gameSession.findUnique({
        where: {id: gameId},
        select: {
            id: true,
            image: {
                select: {
                    id: true,
                    _count:{
                        select: {
                            characters: true,
                        },
                    },
                },
            },
            status: true,
            startedAt: true,
            found: {
                select: {
                    character:{
                        select:{
                            id: true,
                            name: true,
                            xMin: true,
                            xMax: true,
                            yMin: true,
                            yMax: true,
                        },
                    },
                },
            },
            score: true,
            durationMs: true,
        },
    });
};

exports.setGameStatus = async (newStatus, gameId) =>{
    return prisma.gameSession.findUnique({
        where: {id: gameId},
        data: {status: newStatus},

        select: {
            id: true,
            status: true,
        }
    });
};

exports.setGameStart = async (gameId) => {
    return prisma.gameSession.update({
        where:{id: gameId},
        data:{
            startedAt: new Date(),
            status: "PLAYING",
            durationMs: 0,
            found: {
                set: [],
            },
        },
        select: {
            id: true,
            status: true,
            startedAt: true,
        },
    });
};

exports.finishGame = async (gameId, finishedAt, durationMs, db=primsa) => {
    const {count} = await db.gameSession.updateMany({
        where: {
            id: gameId,
            status: "PLAYING",
        },
        data: {
            status: "FINISHED",
            finishedAt: finishedAt,
            durationMs: durationMs,
        }
    });
    return count === 1;
};

exports.runInTransaction = (fn, options) => prisma.$transaction(fn, options);