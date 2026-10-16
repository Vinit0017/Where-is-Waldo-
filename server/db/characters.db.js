const prisma = require("../config/prisma")

exports.findCharacterByCharacterId = async (characterId) =>{
    return prisma.character.findUnique({
        where: {id: characterId},
        select:{
            id: true,
            imageId: true,
            name: true,
            xMin: true,
            xMax: true,
            yMin: true,
            yMax: true,
        },
    });
};

exports.countCharacters = async (imageId, db=prisma) => {
    return db.character.count({
        where: {imageId: imageId},
    });
};