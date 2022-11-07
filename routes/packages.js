/**
 * Packages CRUD routes
 * @author Shuja Naqvi
 */
const router = require('express').Router();
const { validatePackage, isValidated } = require('../middlewares/validators');
const package = require('../controllers/packages');
const { upload } = require('../middlewares/multer');
/**
 * ////////////////////////// Routes /////////////////////////
 * @method post package create
 * @method get get all packagesss
 * @method get get package by id
 * @method put update package
 * @method delete delete package
 */

router.post('/', upload, validatePackage, isValidated, package.create);
router.get('/', package.getAll);
router.get('/:packageId', package.getById);
router.put('/:packageId', upload, validatePackage, isValidated, package.update);

// Export
module.exports = router;
