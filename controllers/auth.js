const nodemailer = require('nodemailer');
const crypto = require('crypto');
const async = require('async');
const Joi = require('joi');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');
const Company = require('../models/Company');
const Student = require('../models/Student');
const { Texts } = require('../utils/texts');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//REGISTER USER API
exports.registerUser = asyncHandler(async (req, res, next) => {
  try {
    // Validation for req.body //
    const address_object = Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    });

    const schema = Joi.object().keys({
      firstName: Joi.string().max(250).required(),
      lastName: Joi.string().max(250).required(),
      email: Joi.string().email().required(),
      type: Joi.string().required().optional().allow(''),
      role: Joi.string().optional().allow(''),
      phone: Joi.string()
        .max(10)
        .pattern(/^[0-9]+$/)
        .required(),
      address: address_object.required(),
      password: Joi.string().min(6).max(255).required(),
      confirm_password: Joi.string().min(6).max(255).required()
    });

    // Storing Error Responses in Result //
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    const { firstName, lastName, type, email, password, confirm_password, address, role, phone } =
      req.body;

    // Check If Password and Confirm Password are same or not //
    if (password !== confirm_password) {
      res.status(403).send(Texts.Password_must_match);
    }

    //Encrypt Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check If user exist with this Email or not //
    const result = await User.findOne({ email: email });
    if (result) {
      res.status(404).send({ message: Texts.emailExists });
    } else {
      // Saving User in DataBase
      const user = await User.create({
        firstName,
        lastName,
        email,
        address,
        password: hashedPassword,
        phone,
        type
      });
      let updateUser;
      if (req.body.type && req.body.type === 'student') {
        userobj = new Student({
          general_Presentation: '',
          presentation_Video: '',
          professional_Picture: '',
          professional_networks: '',

          user: user._id
        });

        await userobj.save();
        updateUser = await User.findByIdAndUpdate(user._id, {
          student: userobj._id
        }).populate('student');
      } else {
        updateUser = user;
      }
      return res.status(200).json({ user: updateUser, message: Texts.userCreated });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

// Email Verfication for new Registrations //
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  try {
    async.waterfall(
      [
        function (done) {
          crypto.randomBytes(20, function (err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function (token, done) {
          const email = req.body.email;
          User.findOne(
            {
              email: email
            },
            function (err, user) {
              if (!user) {
                return res.status(403).send({
                  message: Texts.emailExists
                });
              }
              User.findOneAndUpdate(
                { email: email },
                {
                  $set: {
                    verifyEmailToken: token,
                    emailVerificationExpiresIn: Date.now() + 36000000
                  }
                },
                { new: true },
                function (err) {
                  done(err, token, user);
                }
              );
            }
          );
        },
        function (token, user, done) {
          let transporter = nodemailer.createTransport({
            host: 'mail.gandi.net',
            port: 465,
            secure: true,
            tls: {
              rejectUnauthorized: false
            },
            auth: {
              user: process.env.MailingId,
              pass: process.env.MailingPassword
            }
          });
          //if type student than send email with this format
          if (user.type === 'student') {
            var mailOptions = {
              to: user.email,
              from: process.env.MailingId,
              subject: Texts.Student_verification_Email_Title,
              text:
                Texts.Hi +
                ' ' +
                user.firstName +
                '\n\n' +
                Texts.Student_verification_Email_Body1 +
                '\n\n' +
                Texts.Student_verification_Email_Body2 +
                ' :\n\n' +
                '\n\n' +
                `${process.env.verifyEmail}` +
                '/verifyEmail/' +
                token +
                '\n\n' +
                '\n\n' +
                Texts.Student_verification_Email_Body3 +
                '\n\n' +
                Texts.Student_verification_Email_Body4 +
                '\n\n' +
                Texts.Student_verification_Email_Footer1 +
                '\n\n' +
                '\n\n' +
                Texts.Student_verification_Email_Footer2 +
                '\n\n'
            };
            // else if type Company than send email with this format
          } else if (user.type === 'company') {
            var mailOptions = {
              to: user.email,
              from: process.env.MailingId,
              subject: Texts.Company_verification_Email_Title,
              text:
                Texts.Hello +
                ' ' +
                user.firstName +
                '\n\n' +
                Texts.Company_verification_Email_Body1 +
                '\n\n' +
                Texts.Company_verification_Email_Body2 +
                '\n\n' +
                Texts.Company_verification_Email_Body3 +
                ' :\n\n' +
                '\n\n' +
                `${process.env.verifyEmail}` +
                '/verifyEmail/' +
                token +
                '\n\n' +
                Texts.Company_verification_Email_Body4 +
                '\n\n' +
                Texts.Company_verification_Email_Body5 +
                '\n\n' +
                Texts.Company_verification_Email_Footer1 +
                '\n\n' +
                Texts.Company_verification_Email_Footer2 +
                '\n\n' +
                Texts.Company_verification_Email_Footer3 +
                '\n\n'
            };
          } else {
            console.log('No type found');
          }

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(200).json({ message: Texts.Verification_email_has_been_sent });
          });
        }
      ],
      function (err) {
        if (err) return next(err);
        res.status(200).send({ message: Texts.Verification_email_has_been_sent });
      }
    );
  } catch (error) {
    res.status(400).send({ message: error.message });

    next(error);
  }
});

exports.verifyEmailProcess = asyncHandler(async (req, res, next) => {
  try {
    async.waterfall(
      [
        function (done) {
          User.findOne(
            {
              verifyEmailToken: req.params.token,
              emailVerificationExpiresIn: {
                $gt: Date.now()
              }
            },
            async function (err, user) {
              if (!user) {
                return res.status(403).json({
                  message: Texts.invalidToken
                });
              } else {
                var user = await User.findOneAndUpdate(
                  {
                    verifyEmailToken: req.params.token
                  },
                  {
                    $set: {
                      status: 'active'
                    }
                  }
                );
                let transporter = nodemailer.createTransport({
                  host: 'mail.gandi.net',
                  port: 465,
                  secure: true,
                  tls: {
                    rejectUnauthorized: false
                  },
                  auth: {
                    user: process.env.MailingId,
                    pass: process.env.MailingPassword
                  }
                });
                var mailOptions = {
                  to: user.email,
                  from: process.env.MailingId,
                  subject: 'Votre compte Winaa',
                  text:
                    'Bonjour,' +
                    '\n\n' +
                    'Votre compte a été vérifié avec succès. Vous pouvez à présent vous connecter sur la plateforme Winaa.' +
                    '\n\n' +
                    ' Merci,' +
                    '\n\n' +
                    'L’équipe Winaa`' +
                    '\n\n'
                };
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    return res.status(400).json({ message: error.message });
                  }
                  return res.status(200).json({
                    message: Texts.success + Texts.You_have_successfully_registered_on_WINA
                  });
                  done(error);
                });
              }
            }
          );
        }
      ],
      function (err) {
        console.log(err, 'err');
        return res.status(400).json({
          message: err.message
        });
      }
    );
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
    next(error);
  }
});

//Login User
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const schema = Joi.object().keys({
    email: Joi.string().max(40).required().email(),
    password: Joi.string().min(6).max(255).required()
  });

  const results = schema.validate(req.body);
  if (results.error) {
    return res.status(400).send({ message: results.error.details[0].message });
  }

  //validating email and password
  if (!email) {
    return res.status(400).send({ message: Texts.emailRequired });
  }
  if (!password) {
    return res.status(400).send({ message: Texts.passwordRequired });
  }

  // check if user exists //
  const user = await User.findOne({ email: email }).select('+password');
  if (!user) {
    return res.status(400).send({ message: Texts.Register_your_account });
  }

  // check if user exists //
  const result = await User.findOne({ email: email, status: 'active' }).select('+password');

  if (!result) {
    return res.status(400).send({ message: Texts.unverifiedEmail });
  }
  // Check if password matches

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(400).send({ message: Texts.passwordInvalid });
  }

  sendTokenResponse(user, 200, res);
});

exports.appleLogin = async (req, res, next) => {
  // req body values
  const data = req.body;
  // console.log({ data });
  if (data?.user) {
    const user = await User.findOne({ apple: data.user });
    if (user) {
      sendTokenResponse(user, 200, res);
    } else {
      let newUser = await User.create({
        role: 'user',
        status: 'appleSignup',
        firstName: data?.fullName?.familyName || 'Annonymous',
        lastName: data?.fullName?.givenName || 'User',
        isSignupByApple: true
      });
      sendTokenResponse(newUser, 200, res);
    }
  } else return res.status(400).send({ message: 'Apple User ID is required' });
};
//Get token from Model create cookie and send response

const sendTokenResponse = async (user, statusCode, res) => {
  //create token
  const populateQuery = [
    { path: 'company' },
    {
      path: 'student',
      populate: [
        {
          path: 'softSkills'
        },
        {
          path: 'hardSkills'
        }
      ]
    }
  ];
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  if (user) {
    const student = await User.findById(user._id).populate(populateQuery);

    return res.status(statusCode).cookie('token', token, options).json({
      token: token,
      user: student,
      message: Texts.loginSuccess
    });
  } else {
    return res.send({ message: Texts.error });
  }
};

// USER Logout
exports.logout = asyncHandler(async (req, res, next) => {
  req.session.destroy(() => {
    req.logOut();
    res.clearCookie('token');
    res.status(200).send(Texts.Logout_was_successful);
  });
});

exports.verifyUser = async (req, res, next) => {
  // req body values

  const populateQuery = [
    { path: 'company' },
    {
      path: 'student',
      populate: [
        {
          path: 'softSkills'
        },
        {
          path: 'hardSkills'
        }
      ]
    }
  ];
  const user = await User.findById(req.user._id).populate(populateQuery);

  try {
    // response send
    res.status(200).json({ success: true, user: user });
  } catch (err) {
    next(err);
  }
};

exports.registerByGoogle = async (req, res, next) => {
  // req body values
  try {
    const address = req.body.address;
    const phone = req.body.phone;
    const type = req.body.type;
    const userId = req.body.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        address: address,
        phone: phone,
        type: type,
        status: 'active'
      },
      {
        new: true
      }
    );

    let updateUser;
    if (type === 'student') {
      userobj = new Student({
        general_Presentation: '',
        presentation_Video: '',
        professional_Picture: '',
        professional_networks: '',

        user: user._id
      });

      await userobj.save();
      updateUser = await User.findByIdAndUpdate(
        user._id,
        {
          student: userobj._id
        },
        {
          new: true
        }
      ).populate('student');
    } else {
      updateUser = user;
    }
    const token = user.getSignedJwtToken();

    return res.status(200).json({ user: updateUser, token: token, message: Texts.userCreated });
  } catch (err) {
    next(err);
  }
};

exports.registerBylinkedIn = async (req, res, next) => {
  try {
    const address = req.body.address;
    const phone = req.body.phone;
    const type = req.body.type;
    const userId = req.body.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        address: address,
        phone: phone,
        type: type,
        status: 'active'
      },
      {
        new: true
      }
    );

    let updateUser;
    if (type === 'student') {
      userobj = new Student({
        general_Presentation: '',
        presentation_Video: '',
        professional_Picture: '',
        professional_networks: '',

        user: user._id
      });

      await userobj.save();
      updateUser = await User.findByIdAndUpdate(
        user._id,
        {
          student: userobj._id
        },
        {
          new: true
        }
      ).populate('student');
    } else {
      updateUser = user;
    }
    const token = user.getSignedJwtToken();

    return res.status(200).json({ user: updateUser, token: token, message: Texts.userCreated });
  } catch (err) {
    next(err);
  }
};
