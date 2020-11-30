const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const User = require("../models/User");
const Student = require("../models/Student");

// GET single user Profile
exports.GetProfile = asyncHandler(async (req, res, next) => {
  try {
    const userID = req.params.id;
    const user = await User.findById(userID).populate("student");
    res.status(200).json({ user: user });
  } catch (err) {
    res.status(400).res.json({ message: err.message });
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
    res
      .status(200)
      .json({ message: "Profile updated successfully!", user: user });
  } catch (err) {
    res.status(400).res.json({ message: err.message });
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
    res.status(200).json({ message: "User has been deleted Successfully!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
