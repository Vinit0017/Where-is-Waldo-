const imageQueries = require("../db/images.db");
const CustomError = require("../middlewares/customErrors");

exports.allImages = async(req, res, next) =>{
    try{
        const dbImages= await imageQueries.getAllImages();
        if(dbImages.length === 0) throw new CustomError("No valid images found.", 404, "IMAGE_NOT_FOUND.");

        const formattedResponse = {
            images: dbImages.map((img) =>({
                id: img.id,
                slug: img.slug,
                title: img.title,
                thumbnailUrl: img.url,
                characterCount: img._count.characters,
            })), 
        };

        return res
                .status(200)
                .json(formattedResponse);

    }catch(err){
        next(err);
    }
};



exports.imageMetaData = async(req, res, next) =>{
    try{
        const imageId = Number(req.params.imageId);
        if(Number.isNaN(imageId)) throw new CustomError("Invalid image.", 404, "INVALID_IMAGE_ID");

        const imageData = await imageQueries.getImageDataById(imageId);
        if(!imageData) throw new CustomError("Invalid image id.", 404, "IMAGE_ID_NOT_FOUND");

        const formattedResponse = {
            id: imageData.id,
            title: imageData.title,
            url: imageData.url,
            naturalWidth: imageData.naturalWidth,
            naturalHeight: imageData.naturalHeight,
            targetBoxWidth: 0.06,
            characters: imageData.characters.map((char) => ({
                id: char.id,
                name: char.name,
                iconUrl: char.iconUrl,
            })),
        };

        res.status(200).json(formattedResponse);

    }catch(err){
        next(err);
    }
};