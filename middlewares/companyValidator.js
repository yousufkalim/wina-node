const { check, validationResult } = require('express-validator');

/*
                      <============ Company Registration =============> 
*/
exports.registerCompanyValidation = [
  check('name', 'Name is requried').notEmpty(),
  check('company_type')
    .notEmpty()
    .withMessage('comapny type is requried')
    .isIn(['Startup', 'PME', 'TPE', 'GE', 'ETI'])
    .withMessage('In-valid company type'),
  check('siretNumber', 'Siret number is requried').notEmpty(),
  check('website').trim(),
  check('groupName').trim(),
  check('linkedIn').trim(),
  check('type').trim().notEmpty().withMessage('Type is required'),
  check('address.street', 'Street is requried').notEmpty(),
  check('address.city', 'City is requried').notEmpty(),
  check('address.zip', 'ZipCode is requried').notEmpty(),
  check('address.latitude', 'Latitude is requried').notEmpty(),
  check('address.longitude', 'Longitude is requried').notEmpty(),
  check('contactPerson.firstName', 'first name is requried').notEmpty(),
  check('contactPerson.lastName', 'last name is requried').notEmpty(),
  check('contactPerson.email', 'Email is requried').notEmpty().isEmail().trim(),
  check('contactPerson.positionHeld', 'PositionHeld is requried').notEmpty(),
  check('contactPerson.phone', 'Phone number is requried')
    .notEmpty()
    .isNumeric()
    .withMessage('Only number are allowed')
    .isLength({ min: 10, max: 10 }),
  check('contactPerson.password', 'Password is requried')
    .notEmpty()
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password lenght must be atleast 8 characters'),
  check('contactPerson.confirm_password')
    .notEmpty()
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password lenght must be atleast 8 characters')
    .custom(async (confirm_password, { req }) => {
      const password = req.data.password;
      if (password !== confirm_password) {
        throw new Error('Both password and confirm pasword are not same');
      }
      return true;
    })
];

/*
                      <============ Company Update =============> 
*/
exports.CompanyUpdateValidation = [
  check('name', 'Name is required').notEmpty().trim(),
  check('type')
    .notEmpty()
    .withMessage('Comapny type is requried')
    .isIn(['Startup', 'PME', 'TPE', 'GE', 'ETI'])
    .withMessage('In-valid company type'),
  check('siretNumber', 'Siret number is required')
    .notEmpty()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Siret number can be 20 characters at most')
    .isNumeric()
    .withMessage('Siret number can only be Number'),
  check('website').trim().isURL().withMessage('Can only be a URL'),
  check('linkedIn').trim().isURL().withMessage('Can only be a URL'),
  check('groupName').trim(),
  check('positionHeld').trim(),
  check('address.street', 'Street is required in address').notEmpty().trim(),
  check('address.city', 'City is required in address').notEmpty().trim(),
  check('address.zip', 'ZipCode is required in address ').notEmpty().trim(),
  check('address.latitude', 'latitude is required').notEmpty().trim(),
  check('address.logitude', 'logitude is required').notEmpty().trim()
];

/*
                     <============ Results =============> 
*/
exports.isValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    let message = errors.array()[0].msg;
    res.status(400).send({ message: message });
  }
  next();
};
