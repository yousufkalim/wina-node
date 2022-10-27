const Joi = require('joi');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');
const Student = require('../models/Student');
const Appointment = require('../models/Appointment');
const matchingAlgo = require('../services/searchJobs');
const Skill = require('../models/Skill');
const { Texts } = require('../utils/texts');

var matchingCriteria = new matchingAlgo.MatchingCriteria();
var dealBreaker = new matchingAlgo.DealBreaker();
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
      const error = new Error('Accès refusé!');
      error.status = 400;
      throw error;
    }
    const userType = req.user.type;
    let UploadedPicture = '';
    let video = '';
    let uploadedResume = '';

    // Validating body //
    const professional_network = Joi.object().keys({
      linkedIn: Joi.string().uri(),
      Behance: Joi.string().uri(),
      Dribble: Joi.string().uri(),
      Github: Joi.string().uri()
    });

    const education_info = Joi.object().keys({
      school: Joi.string(),
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
      ),
      end_Date: Joi.string(),
      description: Joi.string().max(600)
    });

    const professional_profileInfo = Joi.object().keys({
      position: Joi.string().max(250),
      company: Joi.string().max(250),
      duration: Joi.object().keys({
        start_date: Joi.string(),
        end_date: Joi.string()
      }),
      description: Joi.string().max(1000)
    });

    const schema = Joi.object().keys({
      general_Presentation: Joi.string().max(2000),
      presentation_Video: Joi.string(),
      professional_Picture: Joi.string(),
      professional_networks: professional_network,
      education: Joi.array().items(education_info),
      professional_profile: Joi.array().items(professional_profileInfo),
      softSkills: Joi.array(),
      hardSkills: Joi.array(),
      resume: Joi.string(),
      positionSought: Joi.object().keys({
        domain: Joi.string(),
        position: Joi.string(),
        startDate: Joi.string(),
        duration: Joi.string(),
        alternationRhythm: Joi.string(),
        dateOfBirth: Joi.string(),
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
      }),

      languages: Joi.array().items({
        name: Joi.string(),
        skill: Joi.string().valid('beginner', 'intermediate', 'fluent', 'native')
      })
    });

    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send(results.error.details[0].message);
    }

    //Storing uploaded image/video name in "UploadedPicture" / "presentation_Video" //
    if (req.files) {
      if (req.files.video) {
        if (req.files.video[0].mimetype == 'video/mp4') {
          if (!(req.files.video[0].size <= 209715200)) {
            res.status(400).send({ message: Texts.Max_size_can_be_200MB });
          } else {
            video = {
              video: req.files.video[0].filename,
              status: 'To be Validated'
            };
          }
        }
      }
      if (req.files.image) {
        if (
          req.files.image[0].mimetype == 'image/jpeg' ||
          req.files.image[0].mimetype == 'image/jpg' ||
          req.files.image[0].mimetype == 'image/png'
        ) {
          UploadedPicture = {
            image: req.files.image[0].filename,
            status: 'To be Validated'
          };
        } else {
          return res.status(400).send({ message: Texts.Please_select_an_image_of_File_type_jpg });
        }
      }
      if (req.files.resume) {
        if (
          req.files.resume[0].mimetype === 'resume/pdf' ||
          req.files.resume[0].mimetype === 'resume/msword' ||
          req.files.resume[0].mimetype ===
            'resume/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          if (!(req.files.resume[0].size <= 10485760)) {
            res.status(400).send({ message: Texts.Max_size_can_be_10MB });
          } else {
            uploadedResume = req.files.resume[0].filename;
          }
        } else {
          res.status(400).send({ message: Texts.Please_select_an_resume_of_File_type_PDF });
        }
      }
    }

    const {
      general_Presentation,
      professional_networks,
      professional_profile,
      education,
      softSkills,
      hardSkills,
      resume,
      positionSought,
      languages
    } = req.body;

    // Creating new student in Database //
    const newStudent = await new Student({
      general_Presentation: general_Presentation,
      presentation_Video: video,
      professional_Picture: UploadedPicture,
      professional_networks: professional_networks,
      professional_profile: professional_profile,
      education: education,
      softSkills: softSkills,
      hard_Skills: hardSkills,
      positionSought: positionSought,
      languages: languages,
      resume: uploadedResume,
      user: req.user.id
    });

    await newStudent.save();

    // Assigning new student ID to Loggined In User //
    const user = await User.findByIdAndUpdate(req.user.id, {
      student: newStudent._id
    });

    return res.status(200).json({ message: Texts.success, student: newStudent, user: user });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

// GET single Student Profile
exports.GetStudentProfile = asyncHandler(async (req, res, next) => {
  try {
    const studentID = req.params.id;
    const student = await Student.findById(studentID).populate('student');
    return res.status(200).json({ user: student });
  } catch (err) {
    next(err);
  }
});

//// Edit Student info ////
exports.edit = asyncHandler(async (req, res, next) => {
  const {
    general_Presentation,
    professional_networks,
    professional_profile,
    education,
    softSkills,
    hardSkills,
    positionSought,

    languages
  } = req.body;
  let UploadedPicture = '';
  let video = '';
  let uploadedResume = '';
  let EDUCATION;
  let PROFESSION_INFO;
  let PROFESSIONAL_NETWORKS;

  if (professional_networks) {
    PROFESSIONAL_NETWORKS = JSON.parse(professional_networks);
    req.body.professional_networks = PROFESSIONAL_NETWORKS;
  }
  if (education) {
    EDUCATION = JSON.parse(education);
    req.body.education = EDUCATION;
  }
  if (professional_profile) {
    PROFESSION_INFO = JSON.parse(professional_profile);
    req.body.professional_profile = PROFESSION_INFO;
  }
  const user = await User.findById(req.user.id);
  try {
    // Validating body //
    const professional_network = Joi.object().keys({
      linkedIn: Joi.string().uri().optional().allow(''),
      Behance: Joi.string().uri().optional().allow(''),
      Dribble: Joi.string().uri().optional().allow(''),
      Github: Joi.string().uri().optional().allow('')
    });

    const education_info = Joi.object().keys({
      school: Joi.string(),
      image: Joi.string().optional().allow(''),
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
      ),
      end_Date: Joi.string(),
      start_Date: Joi.string(),
      description: Joi.string().max(600)
    });

    const professional_profileInfo = Joi.object().keys({
      position: Joi.string().max(250),
      type: Joi.string().max(250),
      place: Joi.string().max(250),
      position_hold: Joi.boolean(),
      image: Joi.string().optional().allow(''),
      company: Joi.string().max(250),
      duration: Joi.object().keys({
        start_date: Joi.string(),
        end_date: Joi.string()
      }),
      description: Joi.string().max(1000)
    });

    const schema = Joi.object().keys({
      general_Presentation: Joi.string().max(2000).optional().allow(''),
      presentation_Video: Joi.string(),
      image: Joi.string().optional().allow(''),
      professional_Picture: Joi.string(),
      professional_networks: professional_network,
      education: Joi.array().items(education_info),
      professional_profile: Joi.array().items(professional_profileInfo),
      resume: Joi.string(),
      softSkills: Joi.array(),
      hardSkills: Joi.array(),
      positionSought: Joi.object().keys({
        domain: Joi.string(),
        position: Joi.string(),
        startDate: Joi.string(),
        duration: Joi.string(),
        alternationRhythm: Joi.string(),
        description: Joi.string(),
        dateOfBirth: Joi.string(),
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
      }),
      languages: Joi.array().items({
        name: Joi.string(),
        skill: Joi.string().valid('beginner', 'intermediate', 'fluent', 'native')
      })
    });
    // Pasrsing
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send({ message: results.error.details[0].message });
    }
    if (softSkills) {
      await Promise.all(
        await softSkills.map(async val => {
          const requestedMaterial = val.skillName;
          if (requestedMaterial) {
            const result = await Skill.find({ skillField: val.skillName });
          }
        })
      );
    }
    //Storing uploaded image/video name in "UploadedPicture" / "presentation_Video" //
    if (req.files) {
      if (req.files.video) {
        if (req.files.video[0].mimetype == 'video/mp4') {
          if (!(req.files.video[0].size <= 209715200)) {
            res.status(400).send({ message: Texts.Max_size_can_be_200MB });
          } else {
            video = {
              video: req.files.video[0].filename,
              status: 'To be Validated'
            };
          }
        }
      }
      if (req.files.image) {
        if (
          req.files.image[0].mimetype == 'image/jpeg' ||
          req.files.image[0].mimetype == 'image/jpg' ||
          req.files.image[0].mimetype == 'image/png'
        ) {
          UploadedPicture = {
            image: req.files.image[0].filename,
            status: 'To be Validated'
          };
        } else {
          return res.status(400).send({ message: Texts.Please_select_an_image_of_File_type_jpg });
        }
      }

      if (req.files.resume) {
        if (
          req.files.resume[0].mimetype === 'resume/pdf' ||
          req.files.resume[0].mimetype === 'resume/msword' ||
          req.files.resume[0].mimetype ===
            'resume/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          if (!(req.files.resume[0].size <= 10485760)) {
            res.status(400).send({ message: Texts.Max_size_can_be_10MB });
          } else {
            uploadedResume = req.files.resume[0].filename;
          }
        } else {
          return res.status(400).send({ message: Texts.Please_select_an_resume_of_File_type_PDF });
        }
      }
    }
    const studentID = user.student;

    // let parsed_professional_network = JSON.parse(professional_networks);
    let userobj;
    if (studentID) {
      let tempUser = await Student.findById(studentID);
      userobj = await Student.findByIdAndUpdate(
        studentID,
        {
          general_Presentation: general_Presentation
            ? general_Presentation
            : tempUser.general_Presentation,
          presentation_Video: video ? video : tempUser.presentation_Video,
          professional_Picture: UploadedPicture ? UploadedPicture : tempUser.professional_Picture,
          professional_networks: PROFESSIONAL_NETWORKS
            ? PROFESSIONAL_NETWORKS
            : tempUser.professional_networks,
          professional_profile: PROFESSION_INFO ? PROFESSION_INFO : tempUser.professional_profile,
          softSkills: softSkills ? softSkills : tempUser.softSkills,
          hardSkills: hardSkills ? hardSkills : tempUser.hardSkills,
          education: EDUCATION ? EDUCATION : tempUser.education,
          positionSought: positionSought ? positionSought : tempUser.positionSought,
          resume: uploadedResume,
          languages: languages ? languages : tempUser.languages
        },
        { new: true }
      );
    } else {
      // Creating new student in Database //
      userobj = new Student({
        general_Presentation: general_Presentation,
        presentation_Video: video,
        professional_Picture: UploadedPicture,
        professional_networks: professional_networks,
        professional_profile: professional_profile,
        education: education,
        softSkills: softSkills,
        hard_Skills: hardSkills,
        positionSought: positionSought,
        languages: languages,
        resume: uploadedResume,
        user: user._id
      });

      await userobj.save();
      // Assigning new student ID to Loggined In User //
      await user.updateOne({
        student: userobj._id
      });
    }

    const updateUser = await User.findByIdAndUpdate(req.user.id, {
      student: userobj._id
    }).populate('student');
    return res.status(200).json({ message: Texts.userUpdated, user: updateUser });
  } catch (err) {
    return res.status(400).json({ message: err.message });
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
        isDeleted: true
      },
      { new: true }
    );

    return res.status(200).json({ message: Texts.userDeleted });
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
      timmings: slotTimmings
    });
    newAppointment.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        appointments: newAppointment._id
      }
    });

    const admin = await User.updateMany(
      { role: 'admin' },
      {
        $push: { appointments: newAppointment._id },
        $push: {
          notifications: {
            title: Texts.Coaching_Appointment_for_Student,
            description: Texts.Student_has_requested_for_Coaching_Appointment
          }
        }
      }
    );

    return res.status(200).json({ message: Texts.success });
  } catch (err) {
    next(err);
  }
});

exports.searchForJob = asyncHandler(async (req, res, next) => {
  try {
    // matchingAlgo.dealBreaker("startingDate", req, res, next);
    // matchingCriteria.location(req, res, next);
    // matchingCriteria.softSkills(req, res, next)
    // matchingCriteria.hardSkills(req, res, next);
    // matchingCriteria.field(req, res, next);
    // matchingCriteria.jobName(req, res, next);
    // matchingCriteria.startDate(req, res, next);
    // matchingCriteria.lengthOfTheAlternate(req, res, next);
    // matchingCriteria.levelOfEducation(req, res, next);
    // matchingCriteria.frequencyOfApprenticeship(req, res, next);
    // matchingCriteria.ageRange(req, res, next);
    // matchingCriteria.search(req, res, next);
    matchingCriteria.display(req, res, next);
  } catch (err) {
    return res.status(400).json({ message: err.message });

    next(err);
  }
});

// GET single Student Profile

exports.GetUser = asyncHandler(async (req, res, next) => {
  try {
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
    const { type } = req.body;
    const userID = req.user.id;
    const requestedUser = await User.findOne({
      _id: userID,
      type: type
    }).populate(populateQuery);

    return res.status(200).json({
      message: Texts.userData,
      user: requestedUser
    });
  } catch (err) {
    next(err);
  }
});
// Delete school of Student Profile
exports.DeleteSchool = asyncHandler(async (req, res, next) => {
  try {
    const schoolID = req.params.id;
    const user = await User.findById(req.user.id);
    let student = await Student.findById(user.student);

    await Student.findByIdAndUpdate(
      student._id,
      {
        $pull: { education: { _id: schoolID } }
      },
      { new: true }
    );
    const updated_user = await User.findByIdAndUpdate(req.user.id, {
      student: student._id
    }).populate('student');
    return res.status(200).json({
      message: Texts.schoolDeleted,
      user: updated_user
    });
  } catch (err) {
    next(err);
  }
});
// Delete ProfessionalInfo  of Student Profile
exports.DeleteProfessionalInfo = asyncHandler(async (req, res, next) => {
  try {
    const schoolID = req.params.id;
    const user = await User.findById(req.user.id);
    let student = await Student.findById(user.student);

    await Student.findByIdAndUpdate(
      student._id,
      {
        $pull: { professional_profile: { _id: schoolID } }
      },
      { new: true }
    );
    const updated_user = await User.findByIdAndUpdate(req.user.id, {
      student: student._id
    }).populate('student');
    return res.status(200).json({
      message: Texts.professional_info_deleted,
      user: updated_user
    });
  } catch (err) {
    next(err);
  }
});

// get soft skills

exports.GetSkills = asyncHandler(async (req, res, next) => {
  try {
    const { type, query } = req.body;
    //var query="négociat"
    if (type === 'Soft Skill') {
      const skills = await Skill.find({
        $and: [
          { skillType: 'Soft Skill' },
          {
            isDeleted: false
          }
        ]
      });
      return res.status(200).send({
        skills: skills,
        message: 'Les compétences ont été récupérées avec succès'
      });
    } else {
      const skills = await Skill.find({
        $and: [
          { skillType: 'Hard Skill' },
          {
            isDeleted: false
          }
          //{ skillField: { $regex: query, $options: "$i" } },
        ]
      });
      return res.status(200).send({
        skills: skills,
        message: 'Les compétences ont été récupérées avec succès'
      });
    }
  } catch (error) {
    return res.status(200).send({ message: error.message });
    next(error);
  }
});

exports.getSoftSkills = async (req, res, next) => {
  try {
    const { type, query } = req.body;
    //var query="négociat"
    if (type === 'Soft Skill') {
      const skills = await Skill.find({
        $and: [
          { skillType: 'Soft Skill' },
          {
            isDeleted: false
          }
        ]
      });
      return res.status(200).send({
        skills: skills,
        message: 'Les compétences ont été récupérées avec succès'
      });
    }
  } catch (err) {
    return res.status(200).send({ message: error.message });
    next(error);
  }
};

exports.getSkillsByType = async (req, res, next) => {
  try {
    const { type, query } = req.body;
    const softSkills = await Skill.find({
      $and: [
        { skillType: 'Soft Skill' },
        {
          isDeleted: false
        }
      ]
    });
    const hardSkills = await Skill.find({
      $and: [
        { skillType: 'Hard Skill' },
        {
          isDeleted: false
        }
      ]
    });

    return res.status(200).send({
      skills: { softSkills: softSkills, hardSkills: hardSkills },
      message: 'Les compétences ont été récupérées avec succès'
    });
  } catch (err) {
    return res.status(200).send({ message: error.message });
    next(error);
  }
};
exports.getHardSkills = async (req, res, next) => {
  try {
    const { type, query } = req.body;
    //var query="négociat"
    if (type === 'Hard Skill') {
      const skills = await Skill.find({
        $and: [
          { skillType: 'Hard Skill' },
          {
            isDeleted: false
          }
        ]
      });
      return res.status(200).send({
        skills: skills,
        message: 'Les compétences ont été récupérées avec succès'
      });
    }
  } catch (err) {
    return res.status(200).send({ message: error.message });
    next(error);
  }
};

// validate appointment
// Appointment for coaching //
exports.validateAppointment = asyncHandler(async (req, res, next) => {
  try {
    const slotTimmings = req.body.status;
    const jobID = req.params.id;
    const studentID = req.user.student;
    if (slotTimmings === 'I am not available at the proposed time') {
      await Appointment.findOneAndUpdate(
        { $and: [{ student: `${studentID}` }, { jobID: `${jobID}` }] },
        { $set: { status: 'Disapproved' } },
        {
          new: true
        }
      );
      return res.status(200).json({ message: Texts.success + Texts.Appoinment_Disapproved });
    } else {
      await Appointment.findOneAndUpdate(
        { $and: [{ student: `${studentID}` }, { jobID: `${jobID}` }] },
        { $set: { status: 'Approved', timmings: slotTimmings } },
        {
          new: true
        }
      );
      return res.status(200).json({ message: Texts.success + Texts.Appoinment_Approved });
    }
  } catch (err) {
    next(err);
  }
});
//Find std with id
exports.getStdById = async (req, res) => {
  try {
    let stdId = req.params.stdId;
    const std = await Student.findById(stdId)
      .populate('hardSkills')
      .populate('softSkills')
      .populate('languages');
      .populate('languages')
      .populate('user');
    res.json({ success: true, std });
  } catch (err) {
    res.json({ success: false, message: 'Internal server error' });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    let appointments = await Appointment.find({
      student: req.user.student,
      isDeleted: false,
      status: 'Approved'
    }).populate('company student jobID');
    res.json({ appointments });
  } catch (err) {
    res.json({ success: false, message: 'Internal server error' });
  }
};
