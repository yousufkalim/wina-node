/**
 * All the validation
 * @author Shuja Naqvi
 */
const { check, validationResult } = require('express-validator');

/*
 ====================
 Validations
 ====================
 */

// Add Member validation
exports.validateMember = [
  check('companyId', 'Company Id is required').notEmpty().trim(),
  check('name', 'Name is required').notEmpty().trim(),
  check('designation', 'Designation is required').notEmpty().trim()
];
// Add Stage validation
exports.validateStage = [
  check('companyId', 'Company Id is required').notEmpty().trim(),
  check('title', 'title is required').notEmpty().trim()
];
// Login validation
exports.validateLogin = [
  check('email', 'Email is required').notEmpty().isEmail().trim().toLowerCase(),
  check('password', 'Password is required').notEmpty().trim().isLength({ min: 8 })
];
// Delete Stage validation
exports.validateStageDel = [check('stageId', 'stage Id is required').notEmpty().trim()];

// Delete Member validation
exports.validateMemberDel = [check('memberId', 'Member Id is required').notEmpty().trim()];
//Update Stage Validation
exports.validateUpdateStage = [
  check('stageId', 'Stage Id is required').notEmpty().trim(),
  check('title', 'title is required').notEmpty().trim()
];
//Update Member Validation
exports.validateUpdateMember = [
  check('memberId', 'Member Id is required').notEmpty().trim(),
  check('name', 'Name is required').notEmpty().trim(),
  check('designation', 'Designation is required').notEmpty().trim()
];

//create interview
exports.validateInterview = [
  check('description', 'description is required').notEmpty().trim(),
  check('company', 'Company Id is required').notEmpty().trim(),
  check('student', 'Student Id is required').notEmpty().trim(),
  check('type', 'Interview required virtual or physical(acceptable)')
    .notEmpty()
    .trim()
    .isIn(['virtual', 'physical']),
  check('start_date', 'Interview date is required').notEmpty().trim()
];

//create interview
exports.validateupdateInterview = [
  //description
  check('description', 'description is required').notEmpty().trim(),
  check('company', 'Company Id is required').notEmpty().trim(),
  check('student', 'Student Id is required').notEmpty().trim(),
  check('status', 'status  is required')
    .notEmpty()
    .trim()
    .isIn(['pending', 'rejected', 'attended', 'accepted']),
  check('start_date', 'Interview date is required').notEmpty().trim()
];

//Update company info
exports.validateUpdateComapny = [
  check('company_description', 'Company description is required').notEmpty().trim(),
  check('website').trim().isURL().withMessage('Can only be a URL'),
  check('linkedIn').trim().isURL().withMessage('Can only be a URL')
];

//Update Team Description
exports.updateTeamDescription = [
  check('teams_description', 'Teams description is required').notEmpty().trim()
];

//Update Stage Description
exports.updateStageDescription = [
  check('stages_description', 'Stages description is required').notEmpty().trim()
];

//create Package
exports.validatePackage = [
  check('title', 'title is required').notEmpty().trim(),
  check('price', 'price  is required').notEmpty().trim(),
  check('type', 'Package type is required')
    .notEmpty()
    .trim()
    .isIn(['1 Month', '3 Months', '6 Months', '12 Months']),
  check('detail', 'detail date is required').notEmpty().trim()
];
/*
 ======================
 Result
 ======================
 */

/**
 * To check if request validated successfully or not, according to our validation strategies
 * @param {object} req
 * @param {object} res
 * @param {*} next
 */
exports.isValidated = (req, res, next) => {
  const errors = validationResult(req); // Validating the request by previous middleware's strategy
  if (!errors.isEmpty()) {
    // On error
    res.status(400).send({ success: false, message: errors.array() }); // Sending first error to the client from array of errors
  } else {
    // Validated successfully
    next(); // Pass the request to next middleware or controller
  }
};
