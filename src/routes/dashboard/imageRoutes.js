const {getTeamImages, getTeamImagesCount} = require("../../queries/teamQueries");
const {getImagesFromFolder, deleteImageFromFolder, findImageByName, getNewPlaceholderNumber, convertBase64ToImage} = require("../../helpers/imageHelper");
const router = require('express').Router();

/**
 * Get all the team images
 */
router.get('/images', async (req, res, next) => {
  try {
    const { limit, offset } = req.query;

    const teamImages = await getTeamImages(limit, offset);
    const total = await getTeamImagesCount();

    res.status(200).json({
      images: teamImages,
      total,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get all the placeholder images
 */
router.get('/images/placeholder', async (req, res, next) => {
  try {
    const { limit, offset } = req.query;

    const placeholders = await getImagesFromFolder('teamplaceholders');
    const total = placeholders.length;

    const filteredPlaceholders = placeholders.slice(offset - 1, offset * limit);


    res.status(200).json({
      placeholders: filteredPlaceholders,
      total,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Delete a placeholder image
 */
router.delete('/images/placeholder/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const file = await findImageByName('teamplaceholders', name);
    console.log("file", file);
    await deleteImageFromFolder('teamplaceholders', file);
    res.status(200).json({
      message: 'Image deleted',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Create a new placeholder image
 */
router.post('/images/placeholder', async (req, res, next) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      let error = new Error("Geeft een afbeelding mee");
      error.status = 400;
      return next(error);
    }

    const lastPlaceholder = await getNewPlaceholderNumber();
    await convertBase64ToImage(base64Image, "teamplaceholders", lastPlaceholder);

    res.status(200).json({
      message: 'Image created',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;