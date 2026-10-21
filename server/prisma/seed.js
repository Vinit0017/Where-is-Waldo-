const prisma = require("../config/prisma");

const images = [
  {
    slug: "skating",
    title: "Chill Skate",
    url: "/image1.png",
    naturalWidth: 1024,
    naturalHeight: 1024,
    characters: [
      {
        name: "Waldo",
        iconUrl: "/icons/waldo.png",
        xMin: 0.6724, xMax: 0.718, yMin: 0.4952, yMax: 0.6358
      },
      
    ],
  },
];

async function populate() {
  for (const { characters, ...imageData } of images) {
    const image = await prisma.image.upsert({
      where: { slug: imageData.slug },
      create: imageData,
      update: imageData,
    });

    for (const c of characters) {
      await prisma.character.upsert({
        where: { imageId_name: { imageId: image.id, name: c.name } },
        create: { ...c, imageId: image.id },
        update: c,
      });
    }
  }
}

populate()
  .then(() => console.log("Seeded successfully!"))
  .catch((e) => {
    console.error("Error:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());