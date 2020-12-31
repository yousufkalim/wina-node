const Joi = require("joi");
const asyncHandler = require("../middlewares/async");
const User = require("../models/User");
const Student = require("../models/Student");
const Appointment = require("../models/Appointment");
const matchingAlgo = require("../services/algorithm");
//// Register User Profile ////

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
    const userType = req.user.type;
    let UploadedPicture = "";
    let video = "";
    let uploadedResume = "";

    // Validating body //
    const professional_network = Joi.object().keys({
      linkedIn: Joi.string().uri(),
      Behance: Joi.string().uri(),
      Dribble: Joi.string().uri(),
      Github: Joi.string().uri(),
    });

    const education_info = Joi.object().keys({
      school: Joi.string(),
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
      positionSought: Joi.object().keys({
        domain: Joi.string(),
        position: Joi.string(),
        startDate: Joi.string(),
        duration: Joi.string(),
        alternationRhythm: Joi.string(),
      }),
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
      if (req.files.video) {
        if (req.files.video[0].mimetype == "video/mp4") {
          if (!(req.files.video[0].size <= 209715200)) {
            const error = new Error(
              "Cannot upload file size greater than 200MB"
            );
            error.status = 400;
            throw error;
          } else {
            video = {
              video: req.files.video[0].filename,
              status: "To be Validated",
            };
          }
        }
      }
      if (req.files.image) {
        if (
          req.files.image[0].mimetype == "image/jpeg" ||
          req.files.image[0].mimetype == "image/jpg" ||
          req.files.image[0].mimetype == "image/png"
        ) {
          UploadedPicture = {
            image: req.files.image[0].filename,
            status: "To be Validated",
          };
        } else {
          const error = new Error(
            "Please select an image of File type JPEG/JPG/PNG"
          );
          error.status = 400;
          throw error;
        }
      }
      if (req.files.resume) {
        if (
          req.files.resume[0].mimetype === "resume/pdf" ||
          req.files.resume[0].mimetype === "resume/msword" ||
          req.files.resume[0].mimetype ===
            "resume/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          if (!(req.files.resume[0].size <= 10485760)) {
            const error = new Error(
              "Cannot upload file size greater than 10MB"
            );
            error.status = 400;
            throw error;
          } else {
            uploadedResume = req.files.resume[0].filename;
          }
        } else {
          const error = new Error(
            "Your resume file should be of File type PDF/DOC/DOCX"
          );
          error.status = 400;
          throw error;
        }
      }
    }

    const {
      general_Presentation,
      professional_networks,
      professional_profile,
      education,
      resume,
      positionSought,
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
      positionSought: positionSought,
      languages: languages,
      resume: uploadedResume,
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

// GET single Student Profile
exports.GetStudentProfile = asyncHandler(async (req, res, next) => {
  try {
    const studentID = req.params.id;
    const student = await Student.findById(studentID).populate("student");
    res.status(200).json({ user: student });
  } catch (err) {
    next(err);
  }
});

//// Edit Student info ////
exports.edit = asyncHandler(async (req, res, next) => {
  let UploadedPicture = "";
  let video = "";
  let uploadedResume = "";

  const userID = await User.findById(req.user.id);
  const studentID = userID.student;

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
      positionSought: Joi.object().keys({
        domain: Joi.string(),
        position: Joi.string(),
        startDate: Joi.string(),
        duration: Joi.string(),
        alternationRhythm: Joi.string(),
      }),
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
      if (req.files.video) {
        if (req.files.video[0].mimetype == "video/mp4") {
          if (!(req.files.video[0].size <= 209715200)) {
            const error = new Error(
              "Cannot upload file size greater than 200MB"
            );
            error.status = 400;
            throw error;
          } else {
            video = {
              video: req.files.video[0].filename,
              status: "To be Validated",
            };
          }
        }
      }
      if (req.files.image) {
        if (
          req.files.image[0].mimetype == "image/jpeg" ||
          req.files.image[0].mimetype == "image/jpg" ||
          req.files.image[0].mimetype == "image/png"
        ) {
          UploadedPicture = {
            image: req.files.image[0].filename,
            status: "To be Validated",
          };
        } else {
          const error = new Error(
            "Please select an image of File type JPEG/JPG/PNG"
          );
          error.status = 400;
          throw error;
        }
      }
      if (req.files.resume) {
        if (
          req.files.resume[0].mimetype === "resume/pdf" ||
          req.files.resume[0].mimetype === "resume/msword" ||
          req.files.resume[0].mimetype ===
            "resume/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          if (!(req.files.resume[0].size <= 10485760)) {
            const error = new Error(
              "Cannot upload file size greater than 10MB"
            );
            error.status = 400;
            throw error;
          } else {
            uploadedResume = req.files.resume[0].filename;
          }
        } else {
          const error = new Error(
            "Your resume file should be of File type PDF/DOC/DOCX"
          );
          error.status = 400;
          throw error;
        }
      }
    }

    const {
      general_Presentation,
      professional_networks,
      professional_profile,
      education,
      positionSought,
      languages,
    } = req.body;

    const user = await Student.findByIdAndUpdate(
      studentID,
      {
        general_Presentation: general_Presentation,
        presentation_Video: video,
        professional_Picture: UploadedPicture,
        professional_networks: professional_networks,
        professional_profile: professional_profile,
        education: education,
        positionSought: positionSought,
        resume: uploadedResume,
        languages: languages,
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Profile Updated Successfully!", user: user });
  } catch (err) {
    next(err);
  }
});

// GET single Student Profile
exports.DeleteProfile = asyncHandler(async (req, res, next) => {
  try {
    const userID = req.user.id;
    const requestedUser = await User.findById(userID);
    await Student.findByIdAndUpdate(
      requestedUser.student,
      {
        isDeleted: true,
      },
      { new: true }
    );

    res.status(200).json({ message: "Student has been deleted Successfully!" });
  } catch (err) {
    next(err);
  }
});

// Appointment for coaching //
exports.bookCoachingAppointment = asyncHandler(async (req, res, next) => {
  try {
    const slotTimmings = req.body.time;
    const studentID = req.user.student;

    const newAppointment = new Appointment({
      student: studentID,
      timmings: slotTimmings,
    });
    newAppointment.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        appointments: newAppointment._id,
      },
    });

    const admin = await User.updateMany(
      { role: "admin" },
      {
        $push: { appointments: newAppointment._id },
        $push: {
          notifications: {
            title: "Coaching Appointment for  Student",
            description: "Student has requested for Coaching Appointment",
          },
        },
      }
    );

    res.status(200).json({ message: "Success! Appoinment Created" });
  } catch (err) {
    next(err);
  }
});

exports.searchForJob = asyncHandler(async (req, res, next) => {
  try {
    matchingAlgo.dealBreaker("startingDate", req, res, next);
  } catch (err) {
    next(err);
  }
});
