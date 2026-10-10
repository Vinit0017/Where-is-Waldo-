const prisma = require("../config/prisma");

async function populate (){
    await prisma.image.create({
        data: {
            slug: "chaos",
            title: "Wind Party",
            url: "/image1.jpg",
            nautralWidth: 1024,
            naturalHeight: 1024,
            characters: {
                name: "Waldo", iconUrl: "/",
                xMin: 0.607, xMax: 0.639,
                yMin: 0.543, yMax: 0.586
            }
        }
    });
}