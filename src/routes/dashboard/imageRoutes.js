const {getImagesFromFolder} = require("../../helpers/imageHelper");
const router = require('express').Router();

/**
 * Get all the team images
 */
router.get('/images', async (req, res, next) => {
  try {
    const { limit, offset } = req.query;

    const images = await getImagesFromFolder('teams');
    const filteredImages = images.slice(0, (offset * limit));

    res.status(200).json({
      images: filteredImages,
      total: images.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;