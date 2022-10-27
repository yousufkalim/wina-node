const Joi = require('joi');
const nodemailer = require('nodemailer');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');
const Skill = require('../models/Skill');
const xlsxFile = require('read-excel-file/node');
const fs = require('fs');
const Domain = require('../models/Domain');
var xlsx = require('xlsx');
// var excelFile = require("/public/skills.xlsx");
const Job = require('../models/Job');
const Company = require('../models/Company');
const Student = require('../models/Student');
const StudentConsultant = require('../models/StudentConsultant');
const CompanyConsultant = require('../models/CompanyConsultant');
const School = require('../models/School');
const Appointment = require('../models/Appointment');
const { socket, io } = require('../app');
const { Texts } = require('../utils/texts');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get List of Skills
exports.skillList = asyncHandler(async (req, res, next) => {
  try {
    const listOfSkills = await Skill.find({ isDeleted: false }).sort({
      _id: -1
    });
    return res.status(200).json({ listOfSkills: listOfSkills });
  } catch (err) {
    next(err);
  }
});

// To Get list of hard and soft skills
exports.allSkillList = asyncHandler(async (req, res, next) => {
  try {
    const allSkills = await Student.findById(req.params.id)
      .populate('softSkills')
      .populate('hardSkills');
    const skills = {
      softSkills: allSkills.softSkills,
      hardSkills: allSkills.hardSkills
    };
    return res.status(200).json({ allSkills: skills });
  } catch (err) {
    next(err);
  }
});
// CREATE Skill
exports.createSkill = asyncHandler(async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      skillField: Joi.string(),
      skillType: Joi.string().valid('Soft Skill', 'Hard Skill')
    });

    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    const { skillField, skillType } = req.body;

    const newSkill = new Skill({
      skillField: skillField,
      skillType: skillType
    });
    await newSkill.save();
    const skills = await Skill.find();
    return res.status(200).json({ message: Texts.Skill_created_successfully, skills: skills });
  } catch (err) {
    next(err);
  }
});

// EDIT Skill
exports.editSkill = asyncHandler(async (req, res, next) => {
  try {
    const skillID = req.params.id;
    const schema = Joi.object().keys({
      skillField: Joi.string(),
      skillType: Joi.string().valid('Soft Skill', 'Hard Skill')
    });

    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    const { skillField, skillType } = req.body;
    const skill = await Skill.findByIdAndUpdate(
      skillID,
      {
        skillField: skillField,
        skillType: skillType
      },
      {
        new: true
      }
    );
    return res.status(200).json({ message: Texts.Skill_Updated_Successfully });
  } catch (err) {
    next(err);
  }
});

//DELETE Skill
exports.deleteSkill = asyncHandler(async (req, res, next) => {
  try {
    const skillID = req.params.id;

    const skill = await Skill.findByIdAndUpdate(
      skillID,
      {
        isDeleted: true
      },
      {
        new: true
      }
    );
    return res.status(200).json({ message: Texts.Skill_Deleted_Successfully });
  } catch (err) {
    next(err);
  }
});
// Get List of Domains
exports.domainList = asyncHandler(async (req, res, next) => {
  try {
    const domains = await Domain.find({ isDeleted: false });
    return res.status(200).json({ domains: domains });
  } catch (err) {
    next(err);
  }
});
// CREATE Domain
exports.createDomain = asyncHandler(async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      title: Joi.string()
    });

    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    let domain = await Domain.findOne({ title: req.body.title });
    if (domain) {
      return res.status(400).send({ message: Texts.DomainAlreadyExists });
    }
    await Domain.create(req.body);
    const domains = await Domain.find();
    return res.status(200).json({ message: Texts.Domain_created_successfully, domains: domains });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// EDIT Domain
exports.editDomain = asyncHandler(async (req, res, next) => {
  try {
    const domainId = req.params.id;
    const schema = Joi.object().keys({
      title: Joi.string()
    });

    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    await Domain.findByIdAndUpdate(domainId, req.body, {
      new: true
    });
    const domains = await Domain.find();

    return res.status(200).json({ domains, message: Texts.Domain_Updated_Successfully });
  } catch (err) {
    next(err);
  }
});

//DELETE Domain
exports.deleteDomain = asyncHandler(async (req, res, next) => {
  try {
    const domainId = req.params.id;

    const skill = await Domain.findByIdAndUpdate(
      domainId,
      {
        isDeleted: true
      },
      {
        new: true
      }
    );
    return res.status(200).json({ message: Texts.Skill_Deleted_Successfully });
  } catch (err) {
    next(err);
  }
});

//JOBS

// Get List of jobs
// exports.jobList = asyncHandler(async (req, res, next) => {
//   try {
//     const jobList = await Job.find({ isDeleted: false });
//     return res.status(200).json({ ListOfJobs: jobList });
//   } catch (err) {
//     next(err);
//   }
// });

exports.jobList = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: 'company'
      },
      {
        path: 'softSkills'
      },
      {
        path: 'hardSkills'
      },
      {
        path: 'company_requests.student',
        populate: {
          path: 'user',
          model: 'User'
        }
      }
    ];
    const { page, pageSize } = req.params;
    const pageNumber = page * 1 || 1;
    const pagesize = pageSize * 1 || 100;
    const skip = (pageNumber - 1) * pagesize;
    const listOfJobs = await Job.find({ isDeleted: false })
      .populate(populateQuery)
      .skip(skip)
      .limit(pagesize);
    const recordLength = await Job.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);
    return res.status(200).json({ count: recordLength[0].count, data: { listOfJobs } });
  } catch (error) {
    return res.status(500).send({ message: error });

    next(error);
  }
});

//Create Job
exports.CreateJob = asyncHandler(async (req, res, next) => {
  try {
    const requestedUser = await User.findById(req.user.id);
    const companyID = req.body.company;
    //validations
    const location_object = Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    });

    const schema = Joi.object().keys({
      title: Joi.string(),
      status: Joi.string().valid('open', 'filled'),
      domain: Joi.string(),
      photo: Joi.string(),
      position: Joi.string(),
      startDate: Joi.string(),
      duration: Joi.string(),
      location: location_object,
      alternationRhythm: Joi.string(),
      softSkills: Joi.array(),
      hardSkills: Joi.array(),
      company: Joi.string(),
      ageRange: Joi.number().valid('18-20', '21-24', '25+'),
      levelOfEducation: Joi.string().valid(
        'Brevet',
        'CAP',
        'BEP',
        'MC',
        'BacGénéral',
        'BacProfessionel',
        'BTS',
        'DUT',
        'Licence',
        'Master',
        'Doctorat'
      )
    });
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    let UploadedPicture = '';
    if (req.file) {
      if (
        req.file.mimetype == 'image/jpeg' ||
        req.file.mimetype == 'image/jpg' ||
        req.file.mimetype == 'image/png'
      ) {
        if (!(req.file.size <= 10485760)) {
          return res.status(400).send({ message: Texts.Max_size_can_be_10MB });
        } else {
          UploadedPicture = {
            image: req.file.filename,
            status: 'Pending'
          };
        }
      } else {
        return res.status(400).send({ message: Texts.Please_select_an_image_of_File_type_jpg });
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
      softSkills,
      hardSkills,
      levelOfEducation,
      ageRange
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
      photo: UploadedPicture || '',
      softSkills: softSkills,
      hardSkills: hardSkills,
      levelOfEducation: levelOfEducation,
      ageRange: ageRange,
      company: companyID
    });
    await newJob.save();

    // Assigning new job ID to company //
    const company = await Company.findByIdAndUpdate(companyID, {
      $push: { job: newJob._id }
    });

    return res.status(200).json({
      message: Texts.success + Texts.jobCreated,
      job: newJob,
      user: requestedUser
    });
  } catch (err) {
    next(err);
  }
});

//// Edit Job ////

exports.EditJob = asyncHandler(async (req, res, next) => {
  try {
    const requestedUser = await User.findById(req.user.id);
    const companyID = req.body.company;
    //validations
    const location_object = Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    });

    const schema = Joi.object().keys({
      title: Joi.string(),
      status: Joi.string().valid('open', 'filled'),
      domain: Joi.string(),
      photo: Joi.string(),
      position: Joi.string(),
      startDate: Joi.string(),
      duration: Joi.string(),
      location: location_object,
      alternationRhythm: Joi.string(),
      softSkills: Joi.array(),
      hardSkills: Joi.array(),
      ageRange: Joi.number().valid('18-20', '21-24', '25+'),
      levelOfEducation: Joi.string().valid(
        'Brevet',
        'CAP',
        'BEP',
        'MC',
        'BacGénéral',
        'BacProfessionel',
        'BTS',
        'DUT',
        'Licence',
        'Master',
        'Doctorat'
      )
    });
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    let UploadedPicture = '';
    if (req.file) {
      if (
        req.file.mimetype == 'image/jpeg' ||
        req.file.mimetype == 'image/jpg' ||
        req.file.mimetype == 'image/png'
      ) {
        if (!(req.file.size <= 10485760)) {
          return res.status(400).send({ message: Texts.Max_size_can_be_10MB });
        } else {
          UploadedPicture = {
            image: req.file.filename,
            status: 'Pending'
          };
        }
      } else {
        return res.status(400).send({ message: Texts.Please_select_an_image_of_File_type_jpg });
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
      ageRange
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
        photo: UploadedPicture || '',
        softSkills: softSkills,
        hardSkills: hardSkills,
        levelOfEducation: levelOfEducation,
        ageRange: ageRange
      },
      {
        new: true
      }
    );
    return res.status(200).json({ message: Texts.success, Job: updatedJob });
  } catch (err) {
    next(err);
  }
});

// Delete Job
exports.DeleteJob = asyncHandler(async (req, res, next) => {
  try {
    const jobID = req.params.id;
    const job = await Job.findById(jobID);
    const companyID = job.company;

    await Job.findByIdAndUpdate(jobID, {
      isDeleted: true
    }).then(async () => {
      const company = await Company.findByIdAndUpdate(companyID, {
        $pull: { job: jobID }
      });
    });
    return res.status(200).json({ message: Texts.success });
  } catch (err) {
    next(err);
  }
});

//GET ALL COMPANIES
exports.companyList = asyncHandler(async (req, res, next) => {
  try {
    const { page, pageSize } = req.params;
    const pageNumber = page * 1 || 1;
    const pagesize = pageSize * 1 || 100;
    const skip = (pageNumber - 1) * pagesize;
    const listOfCompanies = await Company.find({ isDeleted: false })
      .populate('contactPerson.person')

      .skip(skip)
      .limit(pagesize);
    const recordLength = await Company.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);
    return res.status(200).json({ count: recordLength[0].count, data: { listOfCompanies } });
  } catch (err) {
    next(err);
  }
});

// Register Company

exports.registerCompany = asyncHandler(async (req, res, next) => {
  try {
    const requestedUser = await User.findById(req.user.id);
    if (
      requestedUser.student ||
      requestedUser.company ||
      requestedUser.studentConsultant ||
      requestedUser.companyConsultant
    ) {
      const error = new Error('Accès refusé!');
      error.status = 400;
      throw error;
    }
    // Validating body //
    const address_object = Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    });

    const schema = Joi.object().keys({
      name: Joi.string().max(250),
      address: address_object.required(),
      type: Joi.string().valid('Startup', 'PME', 'TPE', 'GE', 'ETI'),
      siretNumber: Joi.string()
        .max(20)
        .pattern(/^[0-9]+$/),
      website: Joi.string().uri().max(250),
      linkedIn: Joi.string().uri().max(300),
      groupName: Joi.string().max(100),
      positionHeld: Joi.string().max(250)
    });

    // Returns Error if any
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }

    // parameters
    const { name, address, type, siretNumber, website, linkedIn, groupName, positionHeld } =
      req.body;

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
        positionHeld: positionHeld
      }
    });
    await newCompany.save();

    // Assigning new Company ID to Loggined In User //
    const user = await User.findByIdAndUpdate(req.user.id, {
      company: newCompany._id
    });
    return res.status(200).json({
      message: Texts.success,
      Company: newCompany,
      user: user
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

// Edit Company
exports.editCompany = asyncHandler(async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    let companyID = req.params.id;
    // Validating body //
    const address_object = Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    });

    const schema = Joi.object().keys({
      name: Joi.string().max(250),
      address: address_object.required(),
      type: Joi.string().valid('Startup', 'PME', 'TPE', 'GE', 'ETI'),
      siretNumber: Joi.string()
        .max(20)
        .pattern(/^[0-9]+$/),
      website: Joi.string().uri().max(250),
      linkedIn: Joi.string().uri().max(300),
      groupName: Joi.string().max(100),
      positionHeld: Joi.string().max(250)
    });

    // Returns Error if any
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }

    // parameters
    const { name, address, type, siretNumber, website, linkedIn, groupName, positionHeld } =
      req.body;

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
          positionHeld: positionHeld
        }
      },
      { new: true }
    );
    return res.status(200).json({
      message: Texts.success,
      company: company
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

// Delete Company
exports.deleteCompany = asyncHandler(async (req, res, next) => {
  try {
    const userID = req.user.id;
    const companyID = req.params.id;
    const requestedUser = await User.findById(userID);
    await Company.findByIdAndUpdate(
      companyID,
      {
        isDeleted: true
      },
      { new: true }
    ).then(async () => {
      await Job.update({ company: companyID }, { $set: { isDeleted: true } }, { multi: true });
    });

    return res.status(200).json({ message: Texts.Company_has_been_deleted_Successfully });
  } catch (err) {
    res.status(400).message({ message: err.message });
  }
});

//Users

// Create User
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
      phone: Joi.string()
        .max(10)
        .pattern(/^[0-9]+$/)
        .required(),
      address: address_object.required(),
      type: Joi.string().valid('student', 'company', 'studentConsultant', 'companyConsultant'),
      status: Joi.string().valid('active', 'deactive'),
      password: Joi.string().min(6).max(255).required(),
      confirm_password: Joi.string().min(6).max(255).required()
    });

    // Storing Error Responses in Result //
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }

    const { firstName, lastName, type, status, email, password, confirm_password, address, phone } =
      req.body;

    // Check If Password and Confirm Password are same or not //
    if (password !== confirm_password) {
      res.status(403).send({ message: Texts.Password_must_match });
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
        type,
        status: 'active',
        address,
        password: hashedPassword,
        phone
      });

      return;
      res.status(200).json({ message: Texts.userCreated, user: user });
    }
  } catch (err) {
    next(err);
  }
});

// GET single user Profile
exports.GetProfile = asyncHandler(async (req, res, next) => {
  try {
    const userID = req.params.id;
    const user = await User.findById(userID);
    return res.status(200).json({ user: user });
  } catch (err) {
    return res.status(400).res.json({ message: err.message });
  }
});

// Edit profile
exports.editProfile = asyncHandler(async (req, res, next) => {
  // Validation for req.body //
  try {
    const userID = req.params.id;
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
      phone: Joi.string()
        .max(10)
        .pattern(/^[0-9]+$/)
        .required(),
      address: address_object.required()
    });
    // Check if the skills are in database or not, If Not then saving them in the database//

    const user = await User.findByIdAndUpdate(
      userID,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        phone: req.body.phone
      },
      { new: true }
    );
    return res.status(200).json({ message: Texts.userUpdated, user: user });
  } catch (err) {
    return res.status(400).res.json({ message: err.message });
  }
});

// Delete User profile
exports.DeleteProfile = asyncHandler(async (req, res, next) => {
  try {
    const userID = req.params.id;
    const requestedUser = await User.findById(userID);
    const user = await User.findByIdAndUpdate(
      userID,
      {
        isDeleted: true
      },
      { new: true }
    ).then(async () => {
      if (requestedUser.student) {
        await Student.findByIdAndUpdate(requestedUser.student, {
          isDeleted: true
        });
      } else if (requestedUser.company) {
        await Company.findByIdAndUpdate(requestedUser.company, {
          isDeleted: true
        });
      } else if (requestedUser.studentConsultant) {
        await StudentConsultant.findByIdAndUpdate(requestedUser.studentConsultant, {
          isDeleted: true
        });
      } else if (requestedUser.companyConsultant) {
        await CompanyConsultant.findByIdAndUpdate(requestedUser.companyConsultant, {
          isDeleted: true
        });
      }
    });
    return res.status(200).json({ message: "L'utilisateur a été supprimé avec succès !" });
  } catch (err) {
    next(err);
  }
});

// GET List of Users
exports.userList = asyncHandler(async (req, res, next) => {
  try {
    const { page, pageSize } = req.params;
    const pageNumber = page * 1 || 1;
    const pagesize = pageSize * 1 || 100;
    const skip = (pageNumber - 1) * pagesize;
    const listOfUsers = await User.find({ isDeleted: false, type: 'student' })
      .skip(skip)
      .limit(pagesize);
    const recordLength = await User.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);
    return res.status(200).json({ count: recordLength[0].count, data: { listOfUsers } });
  } catch (err) {
    next(err);
  }
});

// Validate PICTURES & VIDEOS
exports.StudentfilesToValidate = asyncHandler(async (req, res, next) => {
  try {
    let pictures = [];
    let videos = [];
    const students = await Student.find({
      $and: [
        {
          $or: [
            { 'professional_Picture.status': 'To be Validated' },
            { 'presentation_Video.status': 'To be Validated' }
          ]
        },
        { isDeleted: false }
      ]
    });
    students.map(item => {
      pictures.push(item.professional_Picture);
      videos.push(item.presentation_Video);
    });
    return res.status(200).json({ students: students, pictures: pictures, videos: videos });
  } catch (err) {
    next(err);
  }
});

// Validate PICTURES
exports.validateImages = asyncHandler(async (req, res, next) => {
  try {
    const decision = req.body.decision;
    const studentId = req.body.studentId;
    const requestedStudent = await Student.findById(studentId);
    const userID = requestedStudent.user;
    const user = await User.findById(userID);

    if (decision == 'Validated') {
      const student = await Student.findByIdAndUpdate(studentId, {
        'professional_Picture.status': 'Validated'
      });
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
        subject: Texts.success,
        text: Texts.Your_Profile_picture_has_been_Validated_successfully
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(400).json({ message: error.message });
        }
      });
      res.status(200).json({ message: 'Image validée' });
    } else if (decision == 'refuse') {
      const student = await Student.findByIdAndUpdate(studentId, {
        $unset: { professional_Picture: 1 }
      });
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
        subject: Texts.Validation_failed,
        text: Texts.invalid_profile_picture
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(400).json({ message: error.message });
        }
      });

      return res.status(200).json({ message: Texts.Picture_has_been_deleted });
    }
  } catch (err) {
    next(err);
  }
});

// Validate Videos
exports.validateVideo = asyncHandler(async (req, res, next) => {
  try {
    const decision = req.body.decision;
    const studentId = req.body.studentId;
    const requestedStudent = await Student.findById(studentId);
    const userID = requestedStudent.user;
    const user = await User.findById(userID);

    if (decision == 'Validated') {
      const student = await Student.findByIdAndUpdate(studentId, {
        'presentation_Video.status': 'Validated'
      });
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
        subject: Texts.success,
        text: Texts.Your_Presentational_video_has_been_Validated_successfully
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(400).json({ message: error.message });
        }
      });
      return res.status(200).json({ message: 'Vidéo validée' });
    } else if (decision == 'refuse') {
      const student = await Student.findByIdAndUpdate(studentId, {
        $unset: { presentation_Video: 1 }
      });
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
        subject: Texts.Validation_failed,
        text: Texts.invalid_video
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(400).json({ message: error.message });
        }
      });
      return res.status(200).json({ message: Texts.Video_has_been_deleted });
    }
  } catch (err) {
    next(err);
  }
});

//Validate Job Images
exports.validateJobImages = asyncHandler(async (req, res, next) => {
  try {
    const decision = req.body.decision;
    const jobID = req.body.jobID;
    const requestedJob = await Job.findById(jobID);
    const companyID = requestedJob.company;
    const company = await Company.findById(companyID);
    const userID = company.contactPerson.person;

    const user = await User.findById(userID);
    if (decision == 'Validated') {
      const job = await Job.findByIdAndUpdate(jobID, {
        'photo.status': 'Validated'
      });
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
        subject: Texts.success,
        text: Texts.Your_job_picture_has_been_Validated_successfully
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(400).json({ message: error.message });
        }
      });
      return res.status(200).json({ message: Texts.Picture_validated });
    } else if (decision == 'refuse') {
      const job = await Job.findByIdAndUpdate(jobID, {
        $unset: { photo: 1 }
      });
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
        subject: Texts.Validation_failed,
        text: Texts.invalid_job_picture
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(400).json({ message: error.message });
        }
      });

      return res.status(200).json({ message: Texts.Picture_has_been_deleted });
    }
  } catch (err) {
    next(err);
  }
});

// Create Consultant Profile
exports.createConsultantProfile = asyncHandler(async (req, res, next) => {
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
      type: Joi.string().valid('studentConsultant', 'companyConsultant'),
      status: Joi.string().valid('active', 'deactive'),
      email: Joi.string().email().required(),
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

    const { firstName, lastName, type, status, email, password, confirm_password, address, phone } =
      req.body;

    //// Check If Password and Confirm Password are same or not ////
    if (password !== confirm_password) {
      return res.status(403).send({ message: Texts.Password_must_match });
    }

    //// Check If user exist with this Email or not ////
    const result = await User.findOne({ email: email });
    if (result) {
      return res.status(404).send({ message: Texts.userAlreadyExists });
    } else {
      // Saving User in DataBase
      const user = await User({
        firstName,
        lastName,
        type,
        status,
        email,
        address,
        password,
        phone
      });
      user.save().then(async () => {
        if (type == 'studentConsultant') {
          const studentConsultant = new StudentConsultant({
            user: user._id,
            video: 'video',
            professional_Picture: 'DEFAULT.png'
          });
          studentConsultant.save().then(async () => {
            await User.findByIdAndUpdate(user._id, {
              studentConsultant: studentConsultant._id
            });
          });
          return res.status(200).json({ user: user, studentConsultant: studentConsultant });
        } else if (type == 'companyConsultant') {
          const companyConsultant = new CompanyConsultant({
            user: user._id,
            video: 'video',
            professional_Picture: 'DEFAULT.png'
          });
          companyConsultant.save().then(async () => {
            await User.findByIdAndUpdate(user._id, {
              companyConsultant: companyConsultant._id
            });
          });
          return res.status(200).json({ user: user, companyConsultant: companyConsultant });
        }
      });
    }
  } catch (err) {
    next(err);
  }
});
exports.consultantProfileTeacher = asyncHandler(async (req, res, next) => {
  try {
    const data = await CompanyConsultant.find({ isDeleted: false }).populate('user').sort({
      _id: -1
    });
    return res.status(200).json({ consultantTeacher: data });
  } catch (err) {
    next(err);
  }
});
exports.consultantProfileStudent = asyncHandler(async (req, res, next) => {
  try {
    const data = await StudentConsultant.find({ isDeleted: false }).populate('user').sort({
      _id: -1
    });
    return res.status(200).json({ consultantStudent: data });
  } catch (err) {
    next(err);
  }
});
// SCHOOLS
exports.registerSchool = asyncHandler(async (req, res, next) => {
  try {
    const userID = req.user._id;
    const user = await User.findById(userID);
    const schema = Joi.object().keys({
      secteur_d_etablissement: Joi.string(),
      code_postal_uai: Joi.string(),
      coordonnees: Joi.array().length(2),
      uo_lib: Joi.string()
    });

    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    const { secteur_d_etablissement, code_postal_uai, coordonnees, uo_lib } = req.body;

    const newSchool = new School({
      fields: {
        uo_lib: uo_lib,
        secteur_d_etablissement: secteur_d_etablissement,
        code_postal_uai: code_postal_uai,
        coordonnees: coordonnees
      },
      createdBy: user.role
    });
    await newSchool.save();
    return res.status(200).json({ message: Texts.School_Created_Successfully, school: newSchool });
  } catch (err) {
    next(err);
  }
});

// Edit School //
exports.editSchool = asyncHandler(async (req, res, next) => {
  try {
    const userID = req.user._id;
    const user = await User.findById(userID);
    const schoolId = req.params.id;

    const schema = Joi.object().keys({
      secteur_d_etablissement: Joi.string(),
      code_postal_uai: Joi.string(),
      coordonnees: Joi.array().length(2),
      uo_lib: Joi.string()
    });

    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }
    const { secteur_d_etablissement, code_postal_uai, coordonnees, uo_lib } = req.body;
    const updatedSchool = await School.findByIdAndUpdate(
      schoolId,
      {
        fields: {
          uo_lib: uo_lib,
          secteur_d_etablissement: secteur_d_etablissement,
          code_postal_uai: code_postal_uai,
          coordonnees: coordonnees
        }
      },
      { new: true }
    );

    return res.status(200).json({
      message: Texts.School_updated_Successfully,
      school: updatedSchool
    });
  } catch (err) {
    next(err);
  }
});

// Delete School //
exports.deleteSchool = asyncHandler(async (req, res, next) => {
  try {
    const schoolId = req.params.id;

    const updatedSchool = await School.findByIdAndUpdate(
      schoolId,
      {
        isDeleted: true
      },
      { new: true }
    );

    return res.status(200).json({
      message: Texts.Skill_Deleted_Successfully,
      school: updatedSchool
    });
  } catch (err) {
    next(err);
  }
});

// Appoitmnets API's
//GET All Appointments

exports.getAllAppointments = asyncHandler(async (req, res, next) => {
  try {
    const { page, pageSize } = req.params;
    const pageNumber = page * 1 || 1;
    const pagesize = pageSize * 1 || 100;
    const skip = (pageNumber - 1) * pagesize;
    const listOfAppointments = await Appointment.find({ isDeleted: false })
      .populate('company')
      .populate('jobID')
      .populate({
        path: 'student',
        populate: { path: 'user' }
      })
      .skip(skip)
      .limit(pagesize);
    const recordLength = await Appointment.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);
    return res.status(200).json({ count: recordLength[0].count, data: { listOfAppointments } });
  } catch (err) {
    next(err);
  }
});

//GET All Pending Appointments

exports.getAllPendingAppointments = asyncHandler(async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ status: 'Pending' });
    if (!appointments) {
      return res.status(200).json({
        message: "Il n'y a pas de guichet automatique de rendez-vous"
      });
    } else {
      return res.status(200).json({ message: Texts.success, Appointments: appointments });
    }
  } catch (err) {
    next(err);
  }
});

//GET All Pending Student Appointments
exports.getAllStudentAppointments = asyncHandler(async (req, res, next) => {
  try {
    let filteredArray = [];
    const appointments = await Appointment.find({
      status: 'Pending'
    });
    const result = appointments.filter(item => {
      if (item.student) {
        filteredArray.push(item);
      }
    });
    if (filteredArray.length == 0) {
      return res.status(200).json({
        message: "Il n'y a pas de guichet automatique de rendez-vous"
      });
    } else {
      return res.status(200).json({ message: Texts.success, Appointments: filteredArray });
    }
  } catch (err) {
    next(err);
  }
});

//GET All Pending Company Appointments
exports.getAllCompanyAppointments = asyncHandler(async (req, res, next) => {
  try {
    let filteredArray = [];
    const appointments = await Appointment.find({
      status: 'Pending'
    });
    const result = appointments.filter(item => {
      if (item.company) {
        filteredArray.push(item);
      }
    });
    if (filteredArray.length == 0) {
      return res.status(200).json({
        message: "Il n'y a pas de guichet automatique de rendez-vous"
      });
    } else {
      return res.status(200).json({ message: Texts.success, Appointments: filteredArray });
    }
  } catch (err) {
    next(err);
  }
});

//Delete Appointment
exports.editAppointment = asyncHandler(async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const appointmnet = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        timmings: req.body.slotTimmings,
        status: req.body.status
      },
      {
        new: true
      }
    );
    return;
    res.status(200).json({ message: 'Succès! Rendez-vous modifié' });
  } catch (err) {
    next(err);
  }
});

//Edit Appointment
exports.deleteAppointment = asyncHandler(async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const appointmnet = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        isDeleted: true
      },
      {
        new: true
      }
    );
    return res.status(200).json({ message: 'Succès! Rendez-vous supprimé' });
  } catch (err) {
    next(err);
  }
});

// Validate students appointments for coaching
exports.validateAppointment = asyncHandler(async (req, res, next) => {
  try {
    //Parameters
    const decision = req.body.decision;
    const appointmentId = req.body.appointmentId;

    // if "Approve" pass Consultant ID
    const consultantId = req.body.consultantId;
    //Declarations
    const result = await Appointment.findById(appointmentId);
    if (result.student) {
      if (decision == 'Approve') {
        const consultant = await StudentConsultant.findById(consultantId);
        const appointment = await Appointment.findByIdAndUpdate(
          appointmentId,
          {
            studentConsultant: consultantId,
            status: 'Approved'
          },
          { new: true }
        );
        const student = await Student.findById(appointment.student);
        const user = await User.findByIdAndUpdate(
          student.user,
          {
            $push: {
              notifications: {
                title: Texts.success + Texts.Appointment_Approved,
                description: Texts.Your_Appointment_has_been_approved_successfully
              }
            }
          },
          { new: true }
        );

        // Sending Notification //
        socket.broadcast.emit(`recieveNotification${student.user}`, {
          title: Texts.success + Texts.Appointment_Approved,
          message: Texts.Your_Appointment_has_been_approved_successfully
        });

        const consultantUser = await User.findByIdAndUpdate(consultant.user, {
          $push: {
            notifications: {
              title: Texts.Appointment_Scheduled,
              title: Texts.success + Texts.Appointment_Scheduled,
              description: Texts.Admin_has_assigned_you_an_appointment
            }
          }
        });

        // Sending Notification //
        socket.broadcast.emit(`recieveNotification${consultant.user}`, {
          title: Texts.success + Texts.Appointment_Scheduled,

          message: Texts.Admin_has_assigned_you_an_appointment
        });

        // Sending success mail
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
          subject: Texts.success,
          text: Texts.Your_request_for_Coaching_Appointment_has_been_Approved
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(400).json({ message: error.message });
          }
        });
        return;
        res.status(200).json({
          message: Texts.Your_Appointment_has_been_approved_successfully
        });
      } else if (decision == 'Disapprove') {
        const appointment = await Appointment.findByIdAndUpdate(
          appointmentId,
          {
            status: 'Disapproved'
          },
          { new: true }
        );
        const student = await Student.findById(appointment.student);
        const studentUser = await User.findByIdAndUpdate(
          student.user,
          {
            $push: {
              notifications: {
                title: Texts.Appointment_Cancelled,
                description: Texts.Your_Appointment_has_been_cancelled_by_the_Admin
              }
            }
          },
          { new: true }
        );

        // Sending Notification //
        socket.broadcast.emit(`recieveNotification${student.user}`, {
          title: Texts.Appointment_Cancelled,
          message: Texts.Your_Appointment_has_been_cancelled_by_the_Admin
        });

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
          to: studentUser.email,
          from: process.env.MailingId,
          subject: 'Validation Failed',
          text: Texts.Your_request_for_Coaching_Appointment_has_been_cancelled
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(400).json({ message: error.message });
          }
        });
        return res.status(200).json({ message: 'Rendez-vous annulé !' });
      }
    }
    if (result.company) {
      if (decision == 'Approve') {
        const consultant = await CompanyConsultant.findById(consultantId);
        const appointment = await Appointment.findByIdAndUpdate(
          appointmentId,
          {
            companyConsultant: consultantId,
            status: 'Approved'
          },
          { new: true }
        );
        const company = await Company.findById(appointment.company);
        const user = await User.findByIdAndUpdate(
          company.contactPerson.person,
          {
            $push: {
              notifications: {
                title: Texts.success + Texts.Appointment_Approved,
                description: Texts.Your_Appointment_has_been_approved_successfully
              }
            }
          },
          { new: true }
        );

        // Sending Notification //
        socket.broadcast.emit(`recieveNotification${company.contactPerson.person}`, {
          title: Texts.success + Texts.Appointment_Approved,
          description: Texts.Your_Appointment_has_been_approved_successfully
        });

        const consultantUser = await User.findByIdAndUpdate(consultant.user, {
          $push: {
            notifications: {
              title: Texts.Appointment_Scheduled,
              description: Texts.Admin_has_assigned_you_an_appointment
            }
          }
        });

        // Sending Notification //
        socket.broadcast.emit(`recieveNotification${consultant.user}`, {
          title: Texts.Appointment_Scheduled,
          message: Texts.Admin_has_assigned_you_an_appointment
        });

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
          subject: Texts.success,
          text: Texts.Your_request_for_Coaching_Appointment_has_been_Approved
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(400).json({ message: error.message });
          }
        });

        return res.status(200).json({ message: Texts.Appointment_Approved });
      } else if (decision == 'Disapprove') {
        const appointment = await Appointment.findByIdAndUpdate(
          appointmentId,
          {
            status: 'Disapproved'
          },
          { new: true }
        );
        const company = await Student.findById(appointment.company);
        const compnayUser = await User.findByIdAndUpdate(
          company.user,
          {
            $push: {
              notifications: {
                title: Texts.Appointment_Cancelled,
                description: Texts.Your_Appointment_has_been_cancelled_by_the_Admin
              }
            }
          },
          { new: true }
        );

        // Sending Notification //
        socket.broadcast.emit(`recieveNotification${company.user}`, {
          title: Texts.Appointment_Cancelled,
          message: Texts.Your_Appointment_has_been_cancelled_by_the_Admin
        });

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
          subject: Texts.success,
          text: Texts.Your_request_for_Coaching_Appointment_has_been_cancelled
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(400).json({ message: error.message });
          }
        });
        return res.status(200).json({ message: Texts.Appointment_Cancelled });
      }
    }
  } catch (err) {
    next(err);
  }
});
exports.addJob = asyncHandler(async (req, res, next) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheets = workbook.SheetNames;
    var xlData = workbook.Sheets[sheets[0]];
    let jsonData = xlsx.utils.sheet_to_json(xlData);
    if (jsonData && jsonData.length > 0) {
      const existingSkills = await Skill.find({});
      for (data of jsonData) {
        var company = await Company.findOne({ name: data['Company'] });
        if (!company) {
          company = await Company.create({
            name: data['Company'],
            address: {
              city: data['City'],
              zip: data['Postal Code'],
              latitude: data['longitude'],
              longitude: data['longitude']
            }
          });
        }
        const createSkills = () => {
          let softSkills = [];
          let hardSkills = [];
          return new Promise(async (resolve, reject) => {
            try {
              const jobName = data['Job Name'].split(',');
              if (data['Soft Skills']) {
                let skills = data['Soft Skills'].split(',');
                for (let i = 0; i < skills.length; i++) {
                  const skill = skills[i];

                  if (skill !== '' || skill !== '- ') {
                    var soft_skill = await Skill.findOne({
                      skillField: skill,
                      skillType: 'Soft Skill'
                    });
                    if (!soft_skill) {
                      soft_skill = await Skill.create({
                        skillField: skill,
                        skillType: 'Soft Skill',
                        wordCheck: skill
                      });
                    }
                    softSkills.push(soft_skill._id);
                  }
                }
              }
              if (data['Hard Skills']) {
                let skills = data['Hard Skills'].split(',');
                for (skill of skills) {
                  if (skill !== '') {
                    var hard_skill = await Skill.findOne({
                      skillField: skill,
                      skillType: 'Hard Skill'
                    });
                    if (!hard_skill) {
                      hard_skill = await Skill.create({
                        skillField: skill,
                        skillType: 'Hard Skill',
                        wordCheck: skill
                      });
                    }
                    hardSkills.push(hard_skill._id);
                  }
                }
              }
              if (!data['Hard Skills']) {
                let matchWord = await Skill.find({ wordCheck: { $in: jobName } });
                if (matchWord.length > 0) {
                  for (e of matchWord) {
                    if (e.skillType === 'Hard Skill') {
                      hardSkills.push(e._id);
                    }
                  }
                }
              }
              if (!data['Soft Skills']) {
                let matchWord = await Skill.find({ wordCheck: { $in: jobName } });
                if (matchWord.length > 0) {
                  for (skill of matchWord) {
                    if (e.skillType === 'Soft Skill') {
                      softSkills.push(e._id);
                    }
                  }
                }
              }
            } catch (err) {
              reject(err);
            }
            resolve({ softSkills, hardSkills });
          });
        };
        await createSkills().then(async res => {
          console.log(res);
          const job = await Job.create({
            domain: data['Domain Name'],
            title: data['Job Name'],
            position: data['Poste'],
            company: company._id,
            description: data['Description'],
            startDate: data['Publish Date'],
            softSkills: res.softSkills,
            hardSkills: res.hardSkills,
            location: {
              city: data['City'],
              zip: data['Postal Code'],
              latitude: data['longitude'],
              longitude: data['longitude']
            }
          });
          company.job.push(job._id);
          await company.save();
        });
      }
    }
    let jobs = await Job.find();
    return res.json({ message: 'success', jobs });
  } catch (error) {
    return res.json({ message: error.message });
  }
});

exports.postHardSkills = async (req, res) => {
  try {
    const data = [];
    var array = [];
    //Reading All rows from Excel file and pushing in data array
    await xlsxFile(req.file.path).then(async rows => {
      rows?.forEach(async (item, index) => {
        const wordCheck = item[1]?.trim();
        const array = item[2]?.split(',');
        array?.map((e, index) => {
          if (e) {
            data.push({
              isDeleted: 'false',
              skillField: e.replace('\r', '').replace('\n', ''),
              wordCheck: wordCheck,
              skillType: 'Hard Skill'
            });
          }
        });
      });

      var skix = await Skill.insertMany(data);
      res.status(200).send({ msg: 'Ok', data });
    });

    // inserting all data in database

    // deleting Excel File after saving data to database
  } catch (error) {
    res.status(500).send('Something Failed');
  }
};

exports.postSoftSkills = async (req, res) => {
  try {
    const data = [];
    var array = [];
    // Reading All rows from Excel file and pushing in data array

    //Reading All rows from Excel file and pushing in data array
    await xlsxFile(req.file.path).then(async rows => {
      rows?.forEach(async (item, index) => {
        const wordCheck = item[1]?.trim();
        const array = item[3]?.split(',');
        array?.map((e, index) => {
          if (e) {
            data.push({
              isDeleted: 'false',
              skillField: e.replace('\r', '').replace('\n', ''),
              wordCheck: wordCheck,
              skillType: 'Soft Skill'
            });
          }
        });
      });
      var skix = await Skill.insertMany(data);
      res.status(200).send({ msg: 'Ok', data });
    });
  } catch (error) {
    res.status(500).send('Something Failed');
  }
};

exports.countList = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: false }).estimatedDocumentCount();
    const companies = await Company.find({ isDeleted: false }).estimatedDocumentCount();
    const appointments = await Appointment.find({ isDeleted: false }).estimatedDocumentCount();
    const jobs = await Job.find({ isDeleted: false }).estimatedDocumentCount();
    res.status(200).json({ success: true, students, companies, appointments, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal  Server Error', err: err.message });
  }
};
