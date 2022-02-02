const nodemailer = require("nodemailer");
const crypto = require("crypto");
const async = require("async");
const Joi = require("joi");
const asyncHandler = require("../middlewares/async");
const User = require("../models/User");
const Company = require("../models/Company");
const Student = require("../models/Student");
const { Texts } = require("../utils/texts");
//REGISTER USER API
exports.registerUser = asyncHandler(async (req, res, next) => {
  try {
    // Validation for req.body //
    const address_object = Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    });

    const schema = Joi.object().keys({
      firstName: Joi.string().max(250).required(),
      lastName: Joi.string().max(250).required(),
      email: Joi.string().email().required(),
      type: Joi.string().required().optional().allow(""),
      role: Joi.string().optional().allow(""),
      phone: Joi.string()
        .max(10)
        .pattern(/^[0-9]+$/)
        .required(),
      address: address_object.required(),
      password: Joi.string().min(6).max(255).required(),
      confirm_password: Joi.string().min(6).max(255).required(),
    });

    // Storing Error Responses in Result //
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    const {
      firstName,
      lastName,
      type,
      email,
      password,
      confirm_password,
      address,
      role,
      phone,
    } = req.body;

    //// Check If Password and Confirm Password are same or not ////
    if (password !== confirm_password) {
      res.status(403).send(Texts.Password_must_match);
    }

    //// Check If user exist with this Email or not ////
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
        password,
        phone,
        type,
      });
      let updateUser;
      if (req.body.type && req.body.type === "student") {
        userobj = new Student({
          general_Presentation: "",
          presentation_Video: "",
          professional_Picture: "",
          professional_networks: "",

          user: user._id,
        });

        await userobj.save();
        updateUser = await User.findByIdAndUpdate(user._id, {
          student: userobj._id,
        }).populate("student");
      } else {
        updateUser = user;
      }
      return res
        .status(200)
        .json({ user: updateUser, message: Texts.userCreated });
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
            var token = buf.toString("hex");
            done(err, token);
          });
        },
        function (token, done) {
          const email = req.body.email;
          User.findOne(
            {
              email: email,
            },
            function (err, user) {
              if (!user) {
                return res.status(403).send({
                  message: Texts.emailExists,
                });
              }
              User.findOneAndUpdate(
                { email: email },
                {
                  $set: {
                    verifyEmailToken: token,
                    emailVerificationExpiresIn: Date.now() + 36000000,
                  },
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
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            tls: {
              rejectUnauthorized: false,
            },
            auth: {
              user: process.env.MailingId,
              pass: process.env.MailingPassword,
            },
          });
          var mailOptions = {
            to: user.email,
            from: process.env.MailingId,
            subject: Texts.Verification_email_TITLE,
            text:
              Texts.Verification_email_BODY1 +
              "\n\n" +
              Texts.Verification_email_BODY2 +
              " :\n\n" +
              "URL:" +
              "\n\n" +
              `${process.env.verifyEmail}` +
              "/verifyEmail/" +
              token +
              "\n\n" +
              Texts.Verification_email_URL +
              "\n\n",
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return res.status(400).json({ message: error.message });
            }
            return res
              .status(200)
              .json({ message: Texts.Verification_email_has_been_sent });
          });
        },
      ],
      function (err) {
        if (err) return next(err);
        res
          .status(200)
          .send({ message: Texts.Verification_email_has_been_sent });
      }
    );
  } catch (error) {
    res.status(400).send({ message: error.message });

    next(error);
  }
});

exports.verifyEmailProcess = asyncHandler(async (req, res, next) => {
  try {
    console.log("REQ", req.params);
    async.waterfall(
      [
        function (done) {
          User.findOne(
            {
              verifyEmailToken: req.params.token,
              emailVerificationExpiresIn: {
                $gt: Date.now(),
              },
            },
            async function (err, user) {
              if (!user) {
                return res.status(403).json({
                  message: Texts.invalidToken,
                });
              } else {
                var user = await User.findOneAndUpdate(
                  {
                    verifyEmailToken: req.params.token,
                  },
                  {
                    $set: {
                      status: "active",
                    },
                  }
                );
                let transporter = nodemailer.createTransport({
                  host: "smtp.gmail.com",
                  port: 587,
                  secure: false,
                  tls: {
                    rejectUnauthorized: false,
                  },
                  auth: {
                    user: process.env.MailingId,
                    pass: process.env.MailingPassword,
                  },
                });
                var mailOptions = {
                  to: user.email,
                  from: process.env.MailingId,
                  subject: Texts.emailVerificationSent,
                  text: Texts.You_have_successfully_verified,
                };
                console.log;
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    return res.status(400).json({ message: error.message });
                  }
                  return res.status(200).json({
                    message:
                      Texts.success +
                      Texts.You_have_successfully_registered_on_WINA,
                  });
                  done(error);
                });
              }
            }
          );
        },
      ],
      function (err) {
        console.log(err, "err");
        return res.status(400).json({
          message: err.message,
        });
      }
    );
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
    next(error);
  }
});

//Login User
exports.login = asyncHandler(async (req, res, next) => {
  console.log(req.body, "REQ");
  const { email, password } = req.body;
  const schema = Joi.object().keys({
    email: Joi.string().max(40).required().email(),
    password: Joi.string().min(6).max(255).required(),
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
  const user = await User.findOne({ email: email }).select("+password");
  if (!user) {
    return res.status(400).send({ message: Texts.Register_your_account });
  }

  // check if user exists //
  const result = await User.findOne({ email: email, status: "active" }).select(
    "+password"
  );

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

//Get token from Model create cookie and send response

const sendTokenResponse = async (user, statusCode, res) => {
  //create token
  const populateQuery = [
    { path: "company" },
    {
      path: "student",
      populate: [
        {
          path: "softSkills",
        },
        {
          path: "hardSkills",
        },
      ],
    },
  ];
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  if (user) {
    const student = await User.findById(user._id).populate(populateQuery);

    return res.status(statusCode).cookie("token", token, options).json({
      token: token,
      user: student,
      message: Texts.loginSuccess,
    });
  } else {
    return res.send({ message: Texts.error });
  }
};

// USER Logout
exports.logout = asyncHandler(async (req, res, next) => {
  req.session.destroy(() => {
    req.logOut();
    res.clearCookie("token");
    res.status(200).send(Texts.Logout_was_successful);
  });
});
