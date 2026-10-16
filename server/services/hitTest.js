const { BOX_WIDTH } = require("../config/dataset");

exports.hitTest = (image, character, x, y) =>{
    const boxW = BOX_WIDTH;
    const boxH = boxW * (image.naturalWidth/image.naturalHeight);

    return (
        x - boxW /2 < character.xMax && x + boxW/2 > character.xMin &&
        y - boxH/2 < character.yMax && y + boxH/2 > character.yMin 
    );
}