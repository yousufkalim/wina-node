const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const asyncHandler = require("../middlewares/async");
const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Job = require("../models/Job");

//// Create Job ////

exports.CreateJob = asyncHandler(async (req, res, next) => {
  try {
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.company) {
      const error = new Error("You are not authorized to create Job");
      error.status = 400;
      throw error;
    }
    const companyID = requestedUser.company;
    //validations
    const location_object = Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    });

    const schema = Joi.object().keys({
      title: Joi.string(),
      status: Joi.string().valid("open", "filled"),
      domain: Joi.string(),
      photo: Joi.string(),
      position: Joi.string(),
      startDate: Joi.string(),
      duration: Joi.string(),
      location: location_object,
      alternationRhythm: Joi.string(),
      skills: Joi.object().keys({
        softSkills: Joi.array().items({
          name: Joi.string(),
        }),
        hardSkills: Joi.array().items({
          name: Joi.string(),
        }),
      }),
      levelOfEducation: Joi.string().valid(
        "Brevet",
        "CAP",
        "BEP",
        "MC",
        "BacGénéral",
        "BacProfessionel",
        "BTS",
        "DUT",
        "Licence",
        "Master",
        "Doctorat"
      ),
    });
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    let UploadedPicture = "";
    if (req.files) {
      if (req.files.image) {
        if (
          req.files.image[0].mimetype == "image/jpeg" ||
          req.files.image[0].mimetype == "image/jpg" ||
          req.files.image[0].mimetype == "image/png"
        ) {
          UploadedPicture = {
            image: req.files.image[0].filename,
            status: "Pending",
          };
        } else {
          const error = new Error(
            "Please select an image of File type JPEG/JPG/PNG"
          );
          error.status = 400;
          throw error;
        }
      }
    }

    const {
      title,
      status,
      domain,
      position,
      startDate,
      duration,
      location,
      alternationRhythm,
      skills,
      levelOfEducation,
    } = req.body;

    // Creating new student in Database //
    const newJob = new Job({
      title: title,
      status: status,
      domain: domain,
      position: position,
      startDate: startDate,
      duration: duration,
      location: location,
      alternationRhythm: alternationRhythm,
      photo: UploadedPicture || "",
      skills: skills,
      levelOfEducation: levelOfEducation,
      company: companyID,
    });
    await newJob.save();

    // Assigning new job ID to company //
    const company = await Company.findByIdAndUpdate(companyID, {
      $push: { job: newJob._id },
    });

    res.status(200).json({
      message: "Success! Job created.",
      job: newJob,
      user: requestedUser,
    });
  } catch (err) {
    next(err);
  }
});
