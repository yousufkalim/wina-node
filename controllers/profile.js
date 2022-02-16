const Joi = require("joi");
const asyncHandler = require("../middlewares/async");
const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Skill = require("../models/Skill");
const { Texts } = require("../utils/texts");

const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// GET single user Profile
exports.GetProfile = asyncHandler(async (req, res, next) => {
  try {
    const userID = req.params.id;
    const user = await User.findById(userID).populate("student");
    return res.status(200).json({ user: user });
  } catch (err) {
    return res.status(400).res.json({ message: err.message });
  }
});

exports.GetUser = asyncHandler(async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ resetPasswordToken: token });
    return res.status(200).json({ status: "sucess", user: user });
  } catch (err) {
    return res.status(400).res.json({ message: err.message });
  }
});

// Edit profile
exports.editProfile = asyncHandler(async (req, res, next) => {
  const userID = req.user.id;
  // Validation for req.body //
  try {
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
      phone: Joi.string()
        .max(10)
        .pattern(/^[0-9]+$/)
        .required(),
      address: address_object.required(),
    });
    // Check if the skills are in database or not, If Not then saving them in the database//

    const user = await User.findByIdAndUpdate(
      userID,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        phone: req.body.phone,
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: Texts.Profile_updated_successfully, user: user });
  } catch (err) {
    return res.status(400).res.json({ message: err.message });
  }
});

// Delete User profile
exports.DeleteProfile = asyncHandler(async (req, res, next) => {
  try {
    const userID = req.user.id;
    const requestedUser = await User.findById(req.user.id);
    const user = await User.findByIdAndUpdate(
      userID,
      {
        isDeleted: true,
      },
      { new: true }
    ).then(async () => {
      await Student.findByIdAndUpdate(
        requestedUser.student,
        {
          isDeleted: true,
        },
        { new: true }
      );
    });
    return res
      .status(200)
      .json({ message: Texts.User_has_been_deleted_Successfully });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

//Forget Password//
exports.requestForgetPassword = asyncHandler(async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ message: Texts.No_user_found_with_this_email });
    } else {
      const buf = await crypto.randomBytes(20);
      var token = buf.toString("hex");
      const restPasswordExpires = Date.now() + 36000000;
      await User.findOneAndUpdate(
        { email: email },
        {
          resetPasswordToken: token,
          restPasswordExpires: restPasswordExpires,
        },
        { new: true }
      );
      var smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MailingId,
          pass: process.env.MailingPassword,
        },
      });
      var mailOptions = {
        to: email,
        from: process.env.MailingId,
        subject: "Réinitialisez votre mot de passe - Winaa",
        text:
          "Bonjour,\n\n\n" +
          "Vous avez récemment fait une requête pour réinitialiser votre mot de passe sur la plateforme Winaa.\n\n" +
          "Veuillez cliquer sur le lien suivant pour le réinitialiser:\n\n" +
          `${process.env.verifyEmail}` +
          "/réinitialiser/" +
          token +
          "\n\n" +
          "Merci.\n\n" +
          "L'équipe Winaa",
      };
      await smtpTransport
        .sendMail(mailOptions)
        .then((res) => {
          console.log("mail res", res);
        })
        .catch((err) => res.status(400).json({ message: err.message }));
      return res
        .status(200)
        .json({ message: Texts.Email_has_been_sent_successfully });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
    next(err);
  }
});

//Forget Password update//
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.query.passwordToken,
      restPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return;
      res.status(400).json({
        message: Texts.invalidToken,
      });
    }
    if (req.body.password === req.body.confirm) {
      const salt = await bcrypt.genSalt(10);
      const updatedPassword = await bcrypt.hash(req.body.password, salt);

      var updatedUser = await User.findOneAndUpdate(
        {
          resetPasswordToken: req.query.passwordToken,
        },
        {
          password: updatedPassword,
          $unset: { resetPasswordToken: 1, restPasswordExpires: 1 },
        },
        { new: true }
      );
    } else {
      return res.status(400).json({ message: Texts.passwordInvalid });
    }

    var smtpTransport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MailingId,
        pass: process.env.MailingPassword,
      },
    });
    var mailOptions = {
      to: user.email,
      from: process.env.MailingId,
      subject: "Votre mot de passe a été modifié - Winaa",
      text:
        "Bonjour,\n\n" +
        "Ceci est une confirmation que le mot de passe de votre compte " +
        user.email +
        " vient d'être changé.\n",
    };
    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(400).json({ message: error.message });
      }
    });
    return res.status(200).json({
      message: Texts.Password_updated_successfully,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
});

// Get all Notifications //
exports.getAllNotifications = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: "company",
      },
      {
        path: "student",
      },
      {
        path: "hardSkills",
      },
    ];
    const requestedUser = await User.findById(req.user.id).populate(
      populateQuery
    );
    if (!requestedUser.type) {
      res
        .status(400)
        .send({ message: "Vous n'êtes pas autorisé à obtenir un emploi" });
    } else {
      if (requestedUser.type === "company") {
        const notifications = requestedUser.company.notifications.filter(
          (not) => not.statusNew == true
        );

        return res
          .status(200)
          .json({ message: "Success!", notifications: notifications });
      } else {
        const notifications = requestedUser.student.notifications.filter(
          (not) => not.statusNew == true
        );
        return res
          .status(200)
          .json({ message: "Success!", notifications: notifications });
      }
    }
  } catch (err) {
    next(err);
  }
});

// update user notification
exports.updateNotifications = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.params.id;
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res
        .status(400)
        .send({ message: "Vous n'êtes pas autorisé à obtenir un emploi" });
    }
    let tempNotify;
    if (requestedUser.type === "student") {
      let user = await Student.findById(requestedUser.student).populate(
        "student"
      );
      tempNotify = user.notifications;
      await Student.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            "notifications.$[el].statusNew": false,
            "notifications.$[el].color": "white",
          },
        },
        {
          arrayFilters: [{ "el._id": `${userId}` }],
          new: true,
        }
      );
    } else if (requestedUser.type === "company") {
      let user = await Company.findById(requestedUser.company).populate(
        "company"
      );

      tempNotify = user.notifications;
      await Company.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            "notifications.$[el].statusNew": false,
            "notifications.$[el].color": "#fff",
          },
        },
        {
          arrayFilters: [{ "el._id": `${userId}` }],
          new: true,
        }
      );
    }

    return res
      .status(200)
      .json({ message: "Success!", notifications: tempNotify });
  } catch (err) {
    next(err);
  }
});

// GetSoftSkills
exports.GetSoftSkills = asyncHandler(async (req, res, next) => {
  try {
    const skills = await Skill.find({
      $and: [
        { skillType: { $eq: "Soft Skill" } },
        {
          isDeleted: { $eq: false },
        },
      ],
    });

    if (skills) {
      res.status(200).send({
        skills: skills,
        message: "Les compétences ont été récupérées avec succès",
      });
    }
  } catch (error) {
    res.status(200).send({ message: error.message });
    next(error);
  }
});
