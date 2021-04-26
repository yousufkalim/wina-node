const Joi = require("joi");
const asyncHandler = require("../middlewares/async");
const User = require("../models/User");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Student = require("../models/Student");

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

    const {
      title,
      status,
      domain,
      position,
      startDate,
      duration,
      location,
      alternationRhythm,
      softSkills,
      hardSkills,
      levelOfEducation,
      ageRange,
      photo,
    } = req.body;
    if (typeof softSkills === typeof "") {
      console.log(req.files, "req.file");

      req.body.location = JSON.parse(location);
      req.body.softSkills = JSON.parse(softSkills);
      req.body.hardSkills = JSON.parse(hardSkills);
    }
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
      softSkills: Joi.array(),
      hardSkills: Joi.array(),
      ageRange: Joi.number().valid("18-20", "21-24", "25+"),
      levelOfEducation: Joi.string().valid(
        "1:Brevet",
        "2:CAP",
        "3:BEP",
        "4:MC",
        "5:BacGénéral",
        "6:BacProfessionel",
        "7:BTS",
        "8:DUT",
        "9:Licence",
        "10:Master",
        "11:Doctorat"
      ),
    });
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    let UploadedPicture = {
      image: photo,
      status: "Validated",
    };

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
      softSkills: softSkills,
      hardSkills: hardSkills,
      levelOfEducation: levelOfEducation,
      ageRange: ageRange,
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
    res.status(400).json({
      message: err.message,
    });
    next(err);
  }
});

//// Edit Job ////
exports.EditJob = asyncHandler(async (req, res, next) => {
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
      softSkills: Joi.array(),
      hardSkills: Joi.array(),
      ageRange: Joi.number().valid("18-20", "21-24", "25+"),
      levelOfEducation: Joi.string().valid(
        "1:Brevet",
        "2:CAP",
        "3:BEP",
        "4:MC",
        "5:BacGénéral",
        "6:BacProfessionel",
        "7:BTS",
        "8:DUT",
        "9:Licence",
        "10:Master",
        "11:Doctorat"
      ),
    });
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    let UploadedPicture = "";
    if (req.file) {
      if (
        req.file.mimetype == "image/jpeg" ||
        req.file.mimetype == "image/jpg" ||
        req.file.mimetype == "image/png"
      ) {
        if (!(req.file.size <= 10485760)) {
          const error = new Error("Cannot upload file size greater than 10MB");
          error.status = 400;
          throw error;
        } else {
          UploadedPicture = {
            image: req.file.filename,
            status: "To be Validated",
          };
        }
      } else {
        const error = new Error(
          "Please select an image of File type JPEG/JPG/PNG"
        );
        error.status = 400;
        throw error;
      }
    }

    const {
      title,
      domain,
      position,
      startDate,
      duration,
      location,
      alternationRhythm,
      softSkills,
      hardSkills,
      levelOfEducation,
      ageRange,
    } = req.body;

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title: title,
        domain: domain,
        position: position,
        startDate: startDate,
        duration: duration,
        location: location,
        alternationRhythm: alternationRhythm,
        photo: UploadedPicture || "",
        softSkills: softSkills,
        hardSkills: hardSkills,
        levelOfEducation: levelOfEducation,
        ageRange: ageRange,
      },
      {
        new: true,
      }
    );
    res.status(200).json({ message: "Success! Job Updated", Job: updatedJob });
  } catch (err) {
    res.status(400).json({ message: err.message });

    next(err);
  }
});

// Delete Job
exports.DeleteJob = asyncHandler(async (req, res, next) => {
  try {
    const jobID = req.params.id;
    const userID = req.user.id;
    const user = await User.findById(userID);
    const companyID = user.company;
    const company = await Company.findById(companyID);

    if (company.job) {
      const result = company.job.includes(jobID);
      if (result) {
        await Job.findByIdAndUpdate(jobID, {
          isDeleted: true,
        }).then(async () => {
          const company = await Company.findByIdAndUpdate(companyID, {
            $pull: { job: jobID },
          });
        });
        res.status(200).json({ message: "Job has been deleted successfully" });
      } else {
        res.status(400).json({ message: "You dont own this Job :(" });
      }
    } else {
      res.status(400).json({ message: "You dont own this Job :(" });
    }
  } catch (err) {
    next(err);
  }
});

// GET single Job
exports.GetJob = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: "company",
      },
      {
        path: "softSkills",
      },
      {
        path: "hardSkills",
      },
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: "You are not authorized to get Job" });
    }
    const jobID = req.params.id;
    const job = await Job.findById(jobID).populate(populateQuery);
    if (job) {
      res.status(200).send({ job: job, message: "Job fetched successfully" });
    }
  } catch (error) {
    res.status(200).send({ message: error });

    next(err);
  }
});

// GET all Jobs
exports.GetJobs = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: "company",
      },
      {
        path: "softSkills",
      },
      {
        path: "hardSkills",
      },
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: "You are not authorized to get Job" });
    }
    const jobs = await Job.find().populate(populateQuery);

    if (jobs) {
      res
        .status(200)
        .send({ jobs: jobs, message: "Jobs fetched successfully" });
    }
  } catch (error) {
    res.status(200).send({ message: error });

    next(error);
  }
});

// GET applied Jobs by student
exports.GetAppliedJobs = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: "company",
      },
      {
        path: "student",
      },
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: "You are not authorized to get Job" });
    }
    const jobs = await Job.aggregate([
      {
        $project: {
          student_requests: {
            $filter: {
              input: "$student_requests",
              as: "item",
              cond: { $gte: ["$$item.status", "requested"] },
            },
          },
        },
      },
    ]);

    if (jobs) {
      res
        .status(200)
        .send({ jobs: jobs, message: "Jobs fetched successfully" });
    }
  } catch (error) {
    res.status(200).send({ message: error });

    next(error);
  }
});

// offer accepted by student
exports.OfferDecisionByStudent = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: "company",
      },
      {
        path: "softSkills",
      },
      {
        path: "hardSkills",
      },
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: "You are not authorized to get Job" });
    }
    const JOB_ID = req.params.id;
    const job = await Job.findById(JOB_ID);
    const SENDER_ID = req.user.id;
    const RECIEVER_ID = job.company;
    const schema = Joi.object().keys({
      status: Joi.string().valid("requested", "rejected"),
    });
    let results = schema.validate(req.body);
    if (results.error) {
      return res
        .status(400)
        .send({ message: results.error.details[0].message });
    }
    let newJobs = Job.find({ _id: JOB_ID }, (err, data) => {
      console.log(data);
    });

    // aggregate([
    //   { $match: { _id: SENDER_ID } },
    //   {
    //     $project: {
    //       student_requests: {
    //         $filter: {
    //           input: "$student_requests",
    //           as: "item",
    //           cond: {
    //             $gte: ["$$item.status", "requested"],
    //           },
    //         },
    //       },
    //     },
    //   },
    // ]);
    //   .exec((err, data) => {
    //   console.log(data, "data");
    // });
    // console.log(newJobs);

    // await Job.findByIdAndUpdate(JOB_ID, {
    //   $push: {
    //     student_requests: {
    //       student: SENDER_ID,
    //       status: req.body.status,
    //     },
    //   },
    // });

    // await Company.findByIdAndUpdate(
    //   RECIEVER_ID,
    //   {
    //     $push: {
    //       notifications: {
    //         title: `student is applied on your job`,
    //         jobID: JOB_ID,
    //         description: `${requestedUser.firstName} ${" "} ${
    //           requestedUser.lastName
    //         } is applied on your job`,
    //       },
    //     },
    //   },
    //   { new: true }
    // );
    // const jobs = await Job.find().populate(populateQuery);
    // if (jobs) {
    //   res
    //     .status(200)
    //     .send({ jobs: jobs, message: "Applied on job  successfully" });
    // }
  } catch (error) {
    res.status(404).send({ message: error.message });
    next(error);
  }
});

// offer accepted by company
exports.OfferDecisionByCompany = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: "user",
      },
      {
        path: "softSkills",
      },
      {
        path: "hardSkills",
      },
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: "You are not authorized to get Job" });
    }
    const STUDENT_ID = req.params.id;

    const schema = Joi.object().keys({
      offer_status: Joi.string().valid("accepted", "rejected"),
    });
    let results = schema.validate(req.body);
    if (results.error) {
      return res
        .status(400)
        .send({ message: results.error.details[0].message });
    }
    await Student.findByIdAndUpdate(STUDENT_ID, {
      $set: { offer_status: req.body.offer_status },
    });

    res.status(200).send({
      message: `Offer ${req.body.offer_status} successfully`,
    });
  } catch (error) {
    res.status(404).send({ message: error.message });

    next(error);
  }
});
