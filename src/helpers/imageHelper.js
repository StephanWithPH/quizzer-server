const {staticFolder} = require("../constants");
const crypto = require("crypto");
const base64ImageToFile = require("base64image-to-file");

const convertBase64ToImage = async (base64String, targetFolder) => {
// Check if there is an image, if yes then save it and retrieve the path
  let imagePath;
  //Find the image type
  const imageType = base64String.substring("data:image/".length, base64String.indexOf(";base64"))

  if (base64String && base64String.length > 0) {
    const path = staticFolder + "/images/" + targetFolder;
    const imgName = crypto.randomBytes(20).toString('hex');
    imagePath = await new Promise((resolve, reject) => {
      base64ImageToFile(base64String, path, imgName, function (err, imgPath) {
        if (err) {
          const error = new Error("Fout met uploaden van de afbeelding");
          error.status = 500;
          reject(error);
        }
        resolve(`${path}/${imgName}.${imageType}`);
      });
    });
  }
  return imagePath;
}

  module.exports = {
    convertBase64ToImage
  }