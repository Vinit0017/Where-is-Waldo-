const {Router} = require("express");
const router = Router();

const imageController = require("../controllers/images.controller");

router.get("/images", imageController.allImages);

router.get("/images/:imageId", imageController.imageMetaData);

module.exports = router;