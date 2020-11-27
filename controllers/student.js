const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const User = require("../models/User");
const Student = require("../models/Student");

//// Register User Profile ////

exports.register = asyncHandler(async (req, res, next) => {
  const userType = req.user.type;
  let UploadedPicture = "";
  let video = "";

  try {
    // Validating body //
    const professional_network = Joi.object().keys({
      linkedIn: Joi.string().uri(),
      Behance: Joi.string().uri(),
      Dribble: Joi.string().uri(),
      Github: Joi.string().uri(),
    });

    const education_info = Joi.object().keys({
      school: Joi.string(),
      end_Date: Joi.string(),
      description: Joi.string().max(600),
    });

    const professional_profileInfo = Joi.object().keys({
      position: Joi.string().max(250),
      company: Joi.string().max(250),
      duration: Joi.object().keys({
        start_date: Joi.string(),
        end_date: Joi.string(),
      }),
      description: Joi.string().max(1000),
    });

    const schema = Joi.object().keys({
      general_Presentation: Joi.string().max(2000),
      presentation_Video: Joi.string(),
      professional_Picture: Joi.string(),
      professional_networks: professional_network,
      education: Joi.array().items(education_info),
      professional_profile: Joi.array().items(professional_profileInfo),
      resume: Joi.string(),
      languages: Joi.array().items({
        name: Joi.string(),
        skill: Joi.string().valid(
          "beginner",
          "intermediate",
          "fluent",
          "native"
        ),
      }),
    });

    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }

    //Storing uploaded image/video name in "UploadedPicture" / "presentation_Video" //
    if (req.files) {
      req.files.map((item) => {
        if (item.mimetype == "video/mp4") {
          if (!(item.size <= 209715200)) {
            const error = new Error(
              "Cannot upload file size greater than 200MB"
            );
            error.status = 400;
            throw error;
          } else {
            video = {
              video: item.filename,
              status: "Pending",
            };
          }
        } else {
          UploadedPicture = {
            image: item.filename,
            status: "Pending",
          };
        }
      });
    }

    const {
      general_Presentation,
      professional_networks,
      professional_profile,
      education,
      resume,
      languages,
    } = req.body;

    // Creating new student in Database //
    const newStudent = await new Student({
      general_Presentation: general_Presentation,
      presentation_Video: video,
      professional_Picture: UploadedPicture,
      professional_networks: professional_networks,
      professional_profile: professional_profile,
      education: education,
      languages: languages,
      resume: resume,
      user: req.user.id,
    });
    await newStudent.save();

    // Assigning new student ID to Loggined In User //
    const user = await User.findByIdAndUpdate(req.user.id, {
      student: newStudent._id,
    });

    res
      .status(200)
      .json({ message: "Success!", student: newStudent, user: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//// Edit Student info ////
exports.edit = asyncHandler(async (req, res, next) => {
  let UploadedPicture = "";
  let video = "";

  try {
    // Validating body //
    const professional_network = Joi.object().keys({
      linkedIn: Joi.string().uri(),
      Behance: Joi.string().uri(),
      Dribble: Joi.string().uri(),
      Github: Joi.string().uri(),
    });

    const education_info = Joi.object().keys({
      school: Joi.string(),
      end_Date: Joi.string(),
      description: Joi.string().max(600),
    });

    const professional_profileInfo = Joi.object().keys({
      position: Joi.string().max(250),
      company: Joi.string().max(250),
      duration: Joi.object().keys({
        start_date: Joi.string(),
        end_date: Joi.string(),
      }),
      description: Joi.string().max(1000),
    });

    const schema = Joi.object().keys({
      general_Presentation: Joi.string().max(2000),
      presentation_Video: Joi.string(),
      professional_Picture: Joi.string(),
      professional_networks: professional_network,
      education: Joi.array().items(education_info),
      professional_profile: Joi.array().items(professional_profileInfo),
      resume: Joi.string(),
      languages: Joi.array().items({
        name: Joi.string(),
        skill: Joi.string().valid(
          "beginner",
          "intermediate",
          "fluent",
          "native"
        ),
      }),
    });

    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }

    //Storing uploaded image/video name in "UploadedPicture" / "presentation_Video" //
    if (req.files) {
      req.files.map((item) => {
        if (item.mimetype == "video/mp4") {
          if (!(item.size <= 209715200)) {
            const error = new Error(
              "Cannot upload file size greater than 200MB"
            );
            error.status = 400;
            throw error;
          } else {
            video = {
              video: item.filename,
              status: "Pending",
            };
          }
        } else {
          UploadedPicture = {
            image: item.filename,
            status: "Pending",
          };
        }
      });
    }

    const {
      general_Presentation,
      professional_networks,
      professional_profile,
      education,
      resume,
      languages,
    } = req.body;

    const user = await User.findByIdAndUpdate({
      general_Presentation: general_Presentation,
      professional_networks: professional_networks,
      professional_profile: professional_profile,
      education: education,
      resume: resume,
      languages: languages,
    });
  } catch (err) {}
});
