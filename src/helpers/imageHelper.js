const {staticFolder} = require("../constants");
const crypto = require("crypto");
const base64ImageToFile = require("base64image-to-file");
const fs = require("fs");

const convertBase64ToImage = async (base64String, targetFolder, imgName) => {
// Check if there is an image, if yes then save it and retrieve the path
  //Find the image type
  const imageType = base64String.substring("data:image/".length, base64String.indexOf(";base64"))

  if (base64String && base64String.length > 0) {
    const path = staticFolder + "/images/" + targetFolder;

    // If the name was not provided, generate a random name
    if (!imgName) {
     imgName = crypto.randomBytes(20).toString('hex');
    }
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
  const path = staticFolder + "/images/" + targetFolder;

  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(path)) {
      await fs.readdir(path, (err, files) => {
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

const countImagesSync = (targetFolder) => {
  const path = staticFolder + "/images/" + targetFolder;

  if (fs.existsSync(path)) {
    return fs.readdirSync(path).length;
  }
  return 0;
}

const getImagesFromFolder = async (targetFolder) => {
  const path = staticFolder + "/images/" + targetFolder;

  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(path)) {
      await fs.readdir(path, (err, files) => {
        if (err) {
          reject(err);
        }
        const images = files.map((file) => `static/images/${targetFolder}/${file}`);

        // Sort the images by name
        images.sort((a, b) => {
          const aName = a.split("/").pop().replace(/\.[^/.]+$/, "");
          const bName = b.split("/").pop().replace(/\.[^/.]+$/, "");
          return aName - bName;
        });

        return resolve(images);
      });
    }
  });
}

const findImageByName = async (targetFolder, name) => {
  const path = staticFolder + "/images/" + targetFolder;

  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(path)) {
      return fs.readdir(path, (err, files) => {
        if (err) {
          const error = new Error("Fout met het ophalen van de afbeelding");
          error.status = 500;
          return reject(error);
        }
        const file = files.find((file) => file.includes(name));
        return resolve(file);
      });
    }
    return reject("Geen afbeeldingen gevonden");
  });
}

const getNewPlaceholderNumber = async () => {
  const path = staticFolder + "/images/" + "teamplaceholders";

  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(path)) {
      return fs.readdir(path, (err, files) => {
        if (err) {
          const error = new Error("Fout met het ophalen van de afbeelding");
          error.status = 500;
          return reject(error);
        }
        return resolve(files.length + 1);
      });
    }
    return reject("Geen afbeeldingen gevonden");
  });
}

const deleteImageFromFolder = async (targetFolder, file) => {
 const path = staticFolder + "/images/" + targetFolder;

  return new Promise(async (resolve, reject) => {
    // Check if the file exists
    if (fs.existsSync(path)) {
      // Delete the file
      // Find the file by name
      return fs.unlink(path + '/' + file, err => {
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
};

  module.exports = {
    convertBase64ToImage,
    countImages,
    findImageByName,
    countImagesSync,
    getNewPlaceholderNumber,
    deleteQuestionImage,
    deleteFolder,
    getImagesFromFolder,
    deleteImageFromFolder
  }