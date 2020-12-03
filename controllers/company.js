const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");

// Register Company

exports.register = asyncHandler(async (req, res, next) => {
  try {
    const requestedUser = await User.findById(req.user.id);
    if (
      requestedUser.student ||
      requestedUser.company ||
      requestedUser.studentConsultant ||
      requestedUser.companyConsultant
    ) {
      const error = new Error("Access Denied!");
      error.status = 400;
      throw error;
    }
    // Validating body //
    const address_object = Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    });

    const schema = Joi.object().keys({
      name: Joi.string().max(250),
      address: address_object.required(),
      type: Joi.string().valid("Startup", "PME", "TPE", "GE", "ETI"),
      siretNumber: Joi.string()
        .max(20)
        .pattern(/^[0-9]+$/),
      website: Joi.string().uri().max(250),
      linkedIn: Joi.string().uri().max(300),
      groupName: Joi.string().max(100),
      positionHeld: Joi.string().max(250),
    });

    // Returns Error if any
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }

    // parameters
    const {
      name,
      address,
      type,
      siretNumber,
      website,
      linkedIn,
      groupName,
      positionHeld,
    } = req.body;

    // Creating new Company in Database //
    const newCompany = new Company({
      name: name,
      address: address,
      type: type,
      siretNumber: siretNumber,
      website: website,
      linkedIn: linkedIn,
      groupName: groupName,
      contactPerson: {
        person: req.user.id,
        positionHeld: positionHeld,
      },
    });
    await newCompany.save();

    // Assigning new Company ID to Loggined In User //
    const user = await User.findByIdAndUpdate(req.user.id, {
      company: newCompany._id,
    });
    res.status(200).json({
      message: "Success! Company has been registered.",
      Company: newCompany,
      user: user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit Company
exports.editCompany = asyncHandler(async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    let companyID = user.company;
    // Validating body //
    const address_object = Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    });

    const schema = Joi.object().keys({
      name: Joi.string().max(250),
      address: address_object.required(),
      type: Joi.string().valid("Startup", "PME", "TPE", "GE", "ETI"),
      siretNumber: Joi.string()
        .max(20)
        .pattern(/^[0-9]+$/),
      website: Joi.string().uri().max(250),
      linkedIn: Joi.string().uri().max(300),
      groupName: Joi.string().max(100),
      positionHeld: Joi.string().max(250),
    });

    // Returns Error if any
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }

    // parameters
    const {
      name,
      address,
      type,
      siretNumber,
      website,
      linkedIn,
      groupName,
      positionHeld,
    } = req.body;

    const company = await Company.findByIdAndUpdate(
      companyID,
      {
        name: name,
        address: address,
        type: type,
        siretNumber: siretNumber,
        website: website,
        linkedIn: linkedIn,
        groupName: groupName,
        contactPerson: {
          person: req.user.id,
          positionHeld: positionHeld,
        },
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Company Updated Successfully!", company: company });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Company
exports.deleteCompany = asyncHandler(async (req, res, next) => {
  try {
    const userID = req.user.id;
    const requestedUser = await User.findById(userID);
    await Company.findByIdAndUpdate(
      requestedUser.company,
      {
        isDeleted: true,
      },
      { new: true }
    ).then(async () => {
      await Job.update(
        { company: companyID },
        { $set: { isDeleted: true } },
        { multi: true }
      );
    });

    res.status(200).json({ message: "Company has been deleted Successfully!" });
  } catch (err) {
    res.status(400).message({ message: err.message });
  }
});
