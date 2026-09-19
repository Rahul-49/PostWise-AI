const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createBrandSchema, updateBrandSchema } = require('../validators/schemas');

router.use(authMiddleware);

router.get('/', brandController.getBrands);
router.get('/:id', brandController.getBrandById);
router.post('/', validate(createBrandSchema), brandController.createBrand);
router.put('/:id', validate(updateBrandSchema), brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

module.exports = router;
