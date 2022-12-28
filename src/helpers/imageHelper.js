const {staticFolder} = require("../constants");
const crypto = require("crypto");
const base64ImageToFile = require("base64image-to-file");
const fs = require("fs");

const convertBase64ToImage = async (base64String, targetFolder) => {
// Check if there is an image, if yes then save it and retrieve the path
  //Find the image type
  const imageType = base64String.substring("data:image/".length, base64String.indexOf(";base64"))

  if (base64String && base64String.length > 0) {
    const path = staticFolder + "/images/" + targetFolder;
    const imgName = crypto.randomBytes(20).toString('hex');
    return await new Promise((resolve, reject) => {
      base64ImageToFile(base64String, path, imgName, function (err, imgPath) {
        if (err) {
          const error = new Error("Fout met uploaden van de afbeelding");
          error.status = 500;
          reject(error);
        }
        return resolve(`static/images/${targetFolder}/${imgName}.${imageType}`);
      });
    });
  }
}

const deleteQuestionImage = async (image) => {
  const path = staticFolder + "/images/questions/";

  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(path)) {
      fs.readdir(path, (err, files) => {
        if (err) {
          const error = new Error("Fout met verwijderen van de afbeelding");
          error.status = 500;
          return reject(error);
        }
        const file = files.find((file) => file.includes(image));

        if (file) {
          return fs.unlink(path + file, (err) => {
            if (err) {
              const error = new Error("Fout met verwijderen van de afbeelding");
              error.status = 500;
              return reject(error);
            }
            return resolve("Afbeelding verwijderd");
          });
        }
        return resolve("Geen afbeeldingen gevonden");
      });
    }
  });
}

const deleteFolder = async (targetFolder) => {
  const path = staticFolder + "/images/" + targetFolder;

  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(path)) {
      return fs.rm(path, { recursive: true }, err => {
        if (err) {
          const error = new Error("Fout met verwijderen van de afbeelding");
          error.status = 500;
          return reject(error);
        }

        return resolve("Afbeelding verwijderd");
      })
    }
    return resolve("Geen afbeeldingen gevonden");
  });
}

const countImages = async (targetFolder) => {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(targetFolder)) {
      await fs.readdir(targetFolder, (err, files) => {
        if (err) {
          reject(err);
        }
        return resolve(files.length);
      });
    } else {
      return resolve(0);
    }
  });
}

const getImagesFromFolder = async (targetFolder) => {
  const path = staticFolder + "/images/" + targetFolder;

  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(path)) {
      await fs.readdir(path, (err, files) => {
        if (err) {
          reject(err);
        }
        return resolve(files);
      });
    }
  });
}

  module.exports = {
    convertBase64ToImage,
    countImages,
    deleteQuestionImage,
    deleteFolder,
    getImagesFromFolder
  }