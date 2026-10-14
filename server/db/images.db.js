const prisma = require("../config/prisma")

exports.getAllImages = async () =>{
    return prisma.image.findMany({
        select: {
            id: true,
            slug: true,
            title: true,
            url: true,
            _count: {
                select: {
                    characters: true,
                },
            },
        },
    });
};

exports.getImageDataById = async(imageId) =>{
    return prisma.image.findUnique({
        where: {id: imageId},
        select: {
            id: true,
            title: true,
            url: true,
            naturalWidth: true,
            naturalHeight: true,
            characters: {
                select: {
                    id: true,
                    name: true,
                    iconUrl: true,
                },
            },
        },
    });
}