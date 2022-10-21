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
   check('designation', 'Designation is required').notEmpty().trim(),
 ];
 // Add Stage validation
 exports.validateStage = [
  check('companyId', 'Company Id is required').notEmpty().trim(),
  check('title', 'title is required').notEmpty().trim(),
];
// Login validation
exports.validateLogin = [
  check('email', 'Email is required').notEmpty().isEmail().trim().toLowerCase(),
  check('password', 'Password is required').notEmpty().trim().isLength({ min: 8 })
]
// Delete Stage validation
exports.validateStageDel = [
  check('stageId', 'stage Id is required').notEmpty().trim(),
];

// Delete Member validation
exports.validateMemberDel = [
  check('memberId', 'Member Id is required').notEmpty().trim(),
];
//Update Stage Validation
exports.validateUpdateStage = [
  check('stageId', 'Stage Id is required').notEmpty().trim(),
  check('title', 'title is required').notEmpty().trim(),
];
//Update Member Validation
exports.validateUpdateMember = [
  check('memberId', 'Member Id is required').notEmpty().trim(),
  check('name', 'Name is required').notEmpty().trim(),
  check('designation', 'Designation is required').notEmpty().trim(),
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
     res.status(400).send({ success: false, message: errors.array()[0] }); // Sending first error to the client from array of errors
   } else {
     // Validated successfully
     next(); // Pass the request to next middleware or controller
   }
 };
 