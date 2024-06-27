const fs = require('fs');
function imgFileToBase64(filePath=''){
    const imagePath = filePath;
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    return base64Image;
}

module.exports = imgFileToBase64