const prisma = require("../config/prisma")

exports.getCharacter = async (gameId, characterId) =>{
    return prisma.found.findUnique({
        where: {sessionId_characterId: {sessionId: gameId, characterId: characterId}},
        select: {
            sessionId: true,
            characterId: true,
            foundAt: true,
        },
    });
};

exports.addFound = async(gameId, characterId, db = prisma) =>{
    return db.found.upsert({
        where: {sessionId_characterId: {sessionId: gameId, characterId: characterId}},
        create: { sessionId: gameId, characterId: characterId},
        update: {},
        select:{
            sessionId: true,
            characterId: true,
            foundAt: true,
        },
    });
};

exports.countFound = async (gameId, db = prisma) => {
    return db.found.count({where: {sessionId: gameId}});
}