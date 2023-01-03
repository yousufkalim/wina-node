const Joi = require('joi');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Student = require('../models/Student');
const socket = require('../app');
const { Texts } = require('../utils/texts');
const Appointment = require('../models/Appointment');
const matchingAlgo = require('../services/searchStudents');
var matchingCriteria = new matchingAlgo.MatchingCriteria();
const { matchStudents } = require('../utils/algorithm');

//// Create Job ////
exports.CreateJob = asyncHandler(async (req, res, next) => {
  try {
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.company) {
      return res.status(400).json({
        message: Texts.notAuthorized
      });
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
      description
    } = req.body;
    if (typeof softSkills === typeof '') {
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
      longitude: Joi.number().required()
    });
    const schema = Joi.object().keys({
      title: Joi.string().optional().allow(''),
      status: Joi.string().valid('open', 'filled'),
      domain: Joi.string(),
      description: Joi.string(),
      photo: Joi.string().optional().allow(''),
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
        'Bac Général',
        'Bac Professionel',
        'BTS',
        'DUT',
        'Licence',
        'Master',
        'Doctorat'
      )
    });
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send({ message: results.error.details[0].message });
    }
    let UploadedPicture = {
      image: photo,
      status: 'Validated'
    };
    // Creating new student in Database //
    const newJob = new Job({
      title: title,
      status: status,
      description: description,
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
    await Company.findByIdAndUpdate(companyID, {
      $push: { job: newJob._id }
    });
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
    const jobs = await Job.find({ company: companyID }).populate(populateQuery);
    return res.status(200).json({
      message: 'Offre créée avec succès',
      job: newJob,
      user: requestedUser,
      jobs: jobs
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
  }
});
//// Edit Job ////
exports.EditJob = asyncHandler(async (req, res, next) => {
  try {
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.company) {
      return res.status(400).send({ message: Texts.notAuthorized });
    }
    const companyID = requestedUser.company;
    //validations
    const location_object = Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    });

    const schema = Joi.object().keys({
      title: Joi.string().optional().allow(''),
      status: Joi.string().valid('open', 'filled'),
      domain: Joi.string(),
      description: Joi.string().max(250),
      photo: Joi.string().optional().allow(''),
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
        'Bac Général',
        'Bac Professionel',
        'BTS',
        'DUT',
        'Licence',
        'Master',
        'Doctorat'
      )
    });
    const results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send({ message: results.error.details[0].message });
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
      description,
      photo
    } = req.body;
    let UploadedPicture;
    const prevJob = await Job.findById(req.params.id);
    if (!photo && prevJob) {
      UploadedPicture = {
        image: prevJob.photo.image,
        status: 'Validated'
      };
    } else {
      UploadedPicture = {
        image: photo,
        status: 'Validated'
      };
    }
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title: title,
        domain: domain,
        position: position,
        description: description,
        startDate: startDate,
        duration: duration,
        location: location,
        alternationRhythm: alternationRhythm,
        photo: UploadedPicture,
        softSkills: softSkills,
        hardSkills: hardSkills,
        levelOfEducation: levelOfEducation,
        ageRange: ageRange
      },
      {
        new: true
      }
    );
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
    const jobs = await Job.find({ company: companyID }).populate(populateQuery);
    if (jobs.length > 0) {
      var newData = [];
      for (let i = 0; i < jobs.length; i++) {
        req.params.id = jobs[i]._id;
        const job = { ...jobs[i]._doc };
        const matchedStudents = await matchingCriteria.display(req, res, next);
        job.matchedStudents = matchedStudents.students;
        newData.push(job);
      }
      return res
        .status(200)
        .send({ message: 'Offre mise à jour avec succès', Job: updatedJob, Jobs: jobs });
    } else {
      return res.status(204).send({ message: 'Non trouvé dans la base de données' });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
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
          isDeleted: true
        }).then(async () => {
          const company = await Company.findByIdAndUpdate(companyID, {
            $pull: { job: jobID }
          });
        });
        return res.status(200).json({ message: Texts.jobDeleted });
      } else {
        return res.status(400).json({ message: Texts.notAuthorized });
      }
    } else {
      return res.status(400).json({ message: Texts.notAuthorized });
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
        path: 'company'
      },
      {
        path: 'softSkills'
      },
      {
        path: 'hardSkills'
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    console.log('🚀 ~ requestedUser', requestedUser);
    if (!requestedUser.type) {
      return res.status(400).send({ message: Texts.notAuthorized });
    }
    const jobID = req.params.id;
    const job = await Job.findById(jobID).populate(populateQuery);
    if (job) {
      return res.status(200).send({ job: job, message: 'Travail récupéré avec succès' });
    }
  } catch (error) {
    return res.status(200).send({ message: error.message });
    next(err);
  }
});

// GET all Jobs
exports.GetJobs = asyncHandler(async (req, res, next) => {
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
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      return res.status(400).send({ message: Texts.notAuthorized });
    } else {
      const jobs = await Job.find({ company: requestedUser.company }).populate(populateQuery);

      if (jobs) {
        return res.status(200).send({ jobs: jobs, message: 'Travail récupéré avec succès' });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(200).send({ message: error });

    next(error);
  }
});

// GET applied Jobs by student
exports.GetStudentAppliedJobs = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: 'company',
        populate: [
          {
            path: 'contactPerson',
            populate: [
              {
                path: 'person',
                populate: [
                  {
                    path: 'appointments'
                  }
                ]
              }
            ]
          }
        ]
      },
      { path: 'softSkills' },
      { path: 'hardSkills' },
      {
        path: 'student'
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: Texts.notAuthorized });
    }
    await Job.find()
      .populate(populateQuery)
      .exec(async (err, data) => {
        if (err) {
          res.status(404).send({ message: err.message });
        } else {
          let results = [];
          data.map(dt => {
            if (dt.student_requests && dt.student_requests.length > 0) {
              let check = dt.student_requests.some(
                ft => `${ft.student}` === `${requestedUser.student}` && ft.status !== 'rejected'
              );
              if (check) {
                results.push(dt);
              }
            }
            return data;
          });
          if (results && results.length > 0) {
            res.status(200).send({ jobs: results, message: 'Travail récupéré avec succès' });
          } else {
            res.status(400).send({ jobs: [], message: Texts.error });
          }
        }
      });
  } catch (error) {
    res.status(200).send({ message: error });
    next(error);
  }
});
// GET rejected Jobs by student
exports.GetStudentRejectedJobs = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: 'company'
      },
      { path: 'softSkills' },
      { path: 'hardSkills' },

      {
        path: 'student'
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: Texts.notAuthorized });
    }
    await Job.find()
      .populate(populateQuery)
      .exec(async (err, data) => {
        if (err) {
          res.status(404).send({ message: err.message });
        } else {
          let results = [];
          data.map(dt => {
            if (dt.company_requests && dt.company_requests.length > 0) {
              let check = dt.company_requests.some(
                ft => `${ft.student}` === `${requestedUser.student}` && ft.status === 'rejected'
              );
              if (check) {
                results.push(dt);
              }
            }
          });
          if (results && results.length > 0) {
            res.status(200).send({ jobs: results, message: 'Travail récupéré avec succès' });
          } else {
            res.status(200).send({ jobs: results, message: Texts.error });
          }
        }
      });
  } catch (error) {
    res.status(200).send({ message: error });

    next(error);
  }
});
// offer accepted by student
exports.OfferDecisionByStudent = asyncHandler(async (req, res, next) => {
  try {
    //S
    const populateQuery = [
      {
        path: 'company'
      },
      {
        path: 'softSkills'
      },
      {
        path: 'hardSkills'
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: Texts.notAuthorized });
    }
    const { status } = req.body;
    const JOB_ID = req.params.id;
    const job = await Job.findById(JOB_ID);
    const SENDER_ID = requestedUser.student;
    const RECIEVER_ID = job.company;
    const schema = Joi.object().keys({
      status: Joi.string().valid('requested', 'rejected')
    });
    let results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send({ message: results.error.details[0].message });
    }
    if (status === 'requested') {
      await Job.aggregate([
        {
          $project: {
            student_requests: {
              $filter: {
                input: '$student_requests',
                as: 'item',
                cond: {
                  $gte: ['$$item.status', 'requested']
                }
              }
            }
          }
        }
      ]).exec(async (err, data) => {
        if (err) {
          res.status(404).send({ message: err.message });
        } else {
          let fill = data.find(fl => JOB_ID === `${fl._id}`);
          if (fill && fill.student_requests && fill.student_requests.length > 0) {
            let check = fill.student_requests.some(sr => `${sr.student}` === `${SENDER_ID}`);
            if (check === true) {
              res.status(404).send({ message: Texts.You_have_already_sent_a_request });
            } else {
              await Job.findByIdAndUpdate(JOB_ID, {
                $push: {
                  student_requests: {
                    student: SENDER_ID,
                    jobID: JOB_ID,
                    status: req.body.status
                  }
                }
              });
              if (socket?.socket) {
                socket.io.emit(`recieveNotification${cmp.contactPerson.person._id}`, {
                  title: "Offre demandée par l'étudiant",
                  message: `${requestedUser?.firstName.toUpperCase()} ${requestedUser?.lastName.toUpperCase()} demandé pour le poste de ${job?.position.toUpperCase()}`
                });
                await User.findByIdAndUpdate(
                  cmp.contactPerson.person._id,
                  {
                    $push: {
                      notifications: {
                        title: "Offre demandée par l'étudiant",
                        description: `${requestedUser?.firstName.toUpperCase()} ${requestedUser?.lastName.toUpperCase()} demandé pour le poste de ${job?.position.toUpperCase()}`
                      }
                    }
                  },
                  { new: true }
                );
              }

              const jobs = await Job.find().populate(populateQuery);
              if (jobs) {
                res.status(200).send({
                  jobs: jobs,
                  message: Texts.Applied_on_job_successfully
                });
              }
            }
          } else {
            await Job.findByIdAndUpdate(JOB_ID, {
              $push: {
                student_requests: {
                  student: SENDER_ID,
                  jobID: JOB_ID,
                  status: req.body.status
                }
              }
            });

            if (socket?.socket) {
              const cmp = await Company.findById(RECIEVER_ID).populate('contactPerson.person');
              if (cmp.contactPerson.person._id) {
                socket.io.emit(`recieveNotification${cmp.contactPerson.person._id}`, {
                  title: "Offre demandée par l'étudiant",
                  message: `${requestedUser?.firstName.toUpperCase()} ${requestedUser?.lastName.toUpperCase()} demandé pour le poste de ${job?.position.toUpperCase()}`
                });
                await User.findByIdAndUpdate(
                  cmp.contactPerson.person._id,
                  {
                    $push: {
                      notifications: {
                        title: "Offre demandée par l'étudiant",
                        description: `${requestedUser?.firstName.toUpperCase()} ${requestedUser?.lastName.toUpperCase()} demandé pour le poste de ${job?.position.toUpperCase()}`
                      }
                    }
                  },
                  { new: true }
                );
              }
            }
            const jobs = await Job.find().populate(populateQuery);
            if (jobs) {
              res.status(200).send({
                jobs: jobs,
                message: Texts.Applied_on_job_successfully
              });
            }
          }
        }
      });
    } else {
      await Job.aggregate([
        {
          $project: {
            student_requests: {
              $filter: {
                input: '$student_requests',
                as: 'item',
                cond: {
                  $gte: ['$$item.status', 'rejected']
                }
              }
            }
          }
        }
      ]).exec(async (err, data) => {
        if (err) {
          res.status(404).send({ message: err.message });
        } else {
          let fill = data.find(fl => JOB_ID === `${fl._id}`);
          if (fill && fill.student_requests && fill.student_requests.length > 0) {
            let check = fill.student_requests.some(sr => `${sr.student}` === `${SENDER_ID}`);
            if (check === true) {
              res.status(404).send({
                message: Texts.You_have_already_rejected_this_request
              });
            } else {
              await Job.findByIdAndUpdate(JOB_ID, {
                $push: {
                  student_requests: {
                    student: SENDER_ID,
                    jobID: JOB_ID,
                    status: req.body.status
                  }
                }
              });

              if (socket?.socket) {
                const cmp = await Company.findById(RECIEVER_ID).populate('contactPerson.person');

                if (cmp.contactPerson.person._id) {
                  socket.io.emit(`recieveNotification${cmp.contactPerson.person._id}`, {
                    title: "Offre refusée par l'étudiant",
                    message: `${requestedUser?.firstName.toUpperCase()} ${requestedUser?.lastName.toUpperCase()} a refusé ce poste ${job?.position.toUpperCase()}`
                  });
                  await User.findByIdAndUpdate(
                    cmp.contactPerson.person._id,
                    {
                      $push: {
                        notifications: {
                          title: "Offre refusée par l'étudiant",
                          description: `${requestedUser?.firstName.toUpperCase()} ${requestedUser?.lastName.toUpperCase()} a refusé ce poste ${job?.position.toUpperCase()}`
                        }
                      }
                    },
                    { new: true }
                  );
                }
                const jobs = await Job.find().populate(populateQuery);
                if (jobs) {
                  res.status(200).send({
                    jobs: jobs,
                    message: Texts.Rejected_job_successfully
                  });
                }
              }
            }
          } else {
            await Job.findByIdAndUpdate(JOB_ID, {
              $push: {
                student_requests: {
                  student: SENDER_ID,
                  jobID: JOB_ID,
                  status: req.body.status
                }
              }
            });
            if (socket?.socket) {
              const cmp = await Company.findById(RECIEVER_ID).populate('contactPerson.person');

              if (cmp.contactPerson.person._id) {
                socket.io.emit(`recieveNotification${cmp.contactPerson.person._id}`, {
                  title: "Offre refusée par l'étudiant",
                  message: `${requestedUser?.firstName.toUpperCase()} ${requestedUser?.lastName.toUpperCase()} a refusé ce poste ${job?.position.toUpperCase()}`
                });
                await User.findByIdAndUpdate(
                  cmp.contactPerson.person._id,
                  {
                    $push: {
                      notifications: {
                        title: "Offre refusée par l'étudiant",
                        description: `${requestedUser?.firstName.toUpperCase()} ${requestedUser?.lastName.toUpperCase()} a refusé ce poste ${job?.position.toUpperCase()}`
                      }
                    }
                  },
                  { new: true }
                );
              }
            }
            const jobs = await Job.find().populate(populateQuery);
            if (jobs) {
              res.status(200).send({
                jobs: jobs,
                message: Texts.Rejected_job_successfully
              });
            }
          }
        }
      });
    }
  } catch (error) {
    res.status(404).send({ message: error.message });
    next(error);
  }
});

// recieved offer decision by student
exports.OffersRecievedDecisionByStudent = asyncHandler(async (req, res, next) => {
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
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: Texts.notAuthorized });
    }
    const JOB_ID = req.params.id;
    const job = await Job.findById(JOB_ID);
    const SENDER_ID = requestedUser.student;
    const RECIEVER_ID = job.company;
    const schema = Joi.object().keys({
      status: Joi.string().valid('accepted', 'rejected')
    });
    let results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send({ message: results.error.details[0].message });
    }
    await Job.findOneAndUpdate(
      { _id: JOB_ID },
      { $set: { 'company_requests.$[el].status': req.body.status } },
      {
        arrayFilters: [{ 'el.student': `${SENDER_ID}` }],
        new: true
      }
    );
    if (req.body.status === 'accepted') {
      await Company.findByIdAndUpdate(
        RECIEVER_ID,
        {
          $push: {
            notifications: {
              title: `${requestedUser.firstName} ${' '} ${requestedUser.lastName} ${
                Texts.has_accepted_your_offer
              }`,
              description: `${requestedUser.firstName} ${' '} ${requestedUser.lastName} ${
                Texts.has_accepted_your_offer
              }`
            }
          }
        },
        { new: true }
      );

      const jobs = await Job.find().populate(populateQuery);
      if (jobs) {
        res.status(200).send({
          jobs: jobs,
          message: Texts.Request_has_been_accepted_successfully
        });
      }
    } else {
      await Company.findByIdAndUpdate(
        RECIEVER_ID,
        {
          $push: {
            notifications: {
              title: `${requestedUser.firstName} ${requestedUser.lastName} ${Texts.has_rejected_your_offer}`,
              description: `${requestedUser.firstName} ${requestedUser.lastName} ${Texts.has_rejected_your_offer}`
            }
          }
        },
        { new: true }
      );
      const jobs = await Job.find().populate(populateQuery);
      if (jobs) {
        res.status(200).send({
          jobs: jobs,
          message: Texts.Request_has_been_accepted_successfully
        });
      }
    }
  } catch (error) {
    res.status(404).send({ message: error.message });
    next(error);
  }
});

// cancel offer decision by student
exports.CancelOfferDecisionByStudent = asyncHandler(async (req, res, next) => {
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
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: Texts.notAuthorized });
    }
    const JOB_ID = req.params.id;
    const SENDER_ID = requestedUser.student;
    await Job.findByIdAndUpdate(JOB_ID, {
      $pull: {
        student_requests: {
          $and: [{ status: 'requested', student: SENDER_ID }]
        }
      }
    });

    const jobs = await Job.find().populate(populateQuery);
    if (jobs) {
      res.status(200).send({
        // jobs: jobs,
        message: Texts.Request_has_been_deleted_successfully
      });
    }
  } catch (error) {
    res.status(404).send({ message: error.message });
    next(error);
  }
});
// cancel offer decision by company
exports.CancelOfferDecisionByCompany = asyncHandler(async (req, res, next) => {
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
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: Texts.notAuthorized });
    }
    const schema = Joi.object().keys({
      id: Joi.string().required()
    });
    let results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send({ message: results.error.details[0].message });
    }
    const JOB_ID = req.body.id;
    const SENDER_ID = req.params.id;
    await Job.findByIdAndUpdate(JOB_ID, {
      $pull: {
        company_requests: {
          $and: [{ status: 'requested', student: SENDER_ID }]
        }
      }
    });

    const jobs = await Job.find().populate(populateQuery);
    if (jobs) {
      res.status(200).send({
        // jobs: jobs,
        message: Texts.Request_has_been_deleted_successfully
      });
    }
  } catch (error) {
    res.status(404).send({ message: error.message });
    next(error);
  }
});
//get all offers requested by company and recieved by specific student
exports.GetCompanyAppliedJobs = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: 'company',
        populate: [
          {
            path: 'contactPerson',
            populate: [
              {
                path: 'person',
                populate: [
                  {
                    path: 'appointments'
                  }
                ]
              }
            ]
          }
        ]
      },
      { path: 'softSkills' },
      { path: 'hardSkills' },
      { path: 'student' }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: Texts.notAuthorized });
    }
    // await Job.find()
    //   .populate(populateQuery)
    //   .exec(async (err, data) => {
    //     if (err) {
    //       res.status(404).send({ message: err.message });
    //     } else {
    //       let results = [];
    //       data.map(dt => {
    //         if (dt.company_requests && dt.company_requests.length > 0) {
    //           let check = dt.company_requests.some(
    //             ft =>
    //               `${ft.student}` === `${requestedUser.student}` && `${ft.status}` !== 'rejected'
    //           );
    //           if (check) {
    //             results.push(dt);
    //           }
    //         }
    //         return data;
    //       });
    //       if (results && results.length > 0) {
    //         res.status(200).send({ jobs: results, message: 'Travail récupéré avec succès' });
    //       } else {
    //         res.status(200).send({ jobs: [], message: Texts.error });
    //       }
    //     }
    //   });
    const data = await Job.find({
      'company_requests.student': requestedUser.student,
      'company_requests.status': 'pending'
    }).populate(populateQuery);
    res.status(200).send({ jobs: data, message: 'Travail récupéré avec succès' });
  } catch (error) {
    res.status(200).send({ message: error });

    next(error);
  }
});
// GET all student applied Jobs by student
exports.GetStudentAppliedSuccessJobs = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: 'company',
        path: 'student_requests.student',
        populate: [
          {
            path: 'softSkills'
          },
          {
            path: 'hardSkills'
          },
          {
            path: 'user'
          }
        ]
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: Texts.notAuthorized });
    }
    let results = await Job.find()
      .select({
        student_requests: {
          $elemMatch: {
            $and: [
              { status: 'accepted' },
              {
                student: requestedUser.student
              }
            ]
          }
        }
      })
      .populate(populateQuery);
    console.log(results, 're');
    // .populate(populateQuery);
    if (results) {
      res.status(200).send({
        jobs: results,
        message: 'Travail récupéré avec succès'
      });
    }
  } catch (error) {
    res.status(200).send({ message: error });

    next(error);
  }
});
// GET all student applied Jobs by company
exports.GetAllStudentAppliedJobs = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: 'student_requests.student',
        populate: [
          {
            path: 'softSkills'
          },
          {
            path: 'hardSkills'
          },
          {
            path: 'user'
          }
        ]
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: Texts.notAuthorized });
    }
    const JOB_ID = req.params.id;
    let results = await Job.findOne({ _id: JOB_ID })
      .select({
        _id: true,
        student_requests: {
          $elemMatch: {
            $or: [{ status: 'requested' }, { status: 'accepted' }]
          }
        }
      })
      .populate(populateQuery);
    if (results) {
      res.status(200).send({
        jobs: results.student_requests,
        message: 'Travail récupéré avec succès'
      });
    }
  } catch (error) {
    res.status(200).send({ message: error });

    next(error);
  }
});
// GET all company applied Jobs by company
exports.GetAllCompanyAppliedJobs = asyncHandler(async (req, res, next) => {
  try {
    const populateQuery = [
      {
        path: 'company_requests.student',
        populate: [
          {
            path: 'softSkills'
          },
          {
            path: 'hardSkills'
          },
          {
            path: 'user'
          }
        ]
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: Texts.notAuthorized });
    }
    const JOB_ID = req.params.id;
    let results = await Job.findOne({ _id: JOB_ID })
      .select({
        company_requests: {
          $elemMatch: {
            $or: [{ status: 'requested' }, { status: 'accepted' }]
          }
        }
      })
      .populate(populateQuery);
    console.log('results', results);
    if (results) {
      res.status(200).send({
        jobs: results.company_requests,
        message: 'Travail récupéré avec succès'
      });
    }
  } catch (error) {
    res.status(200).send({ message: error });

    next(error);
  }
});
// offer accepted by company
exports.OfferDecisionByCompany = asyncHandler(async (req, res, next) => {
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
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      return res.status(400).send({ message: Texts.notAuthorized });
    }
    const { status, offerID } = req.body;

    const JOB_ID = offerID;
    const SENDER_ID = requestedUser.company;
    const company = await Company.findById(SENDER_ID);
    const RECIEVER_ID = req.params.id;
    const schema = Joi.object().keys({
      status: Joi.string().valid('requested', 'rejected'),
      offerID: Joi.string().required()
    });
    let results = schema.validate(req.body);

    if (results.error) {
      return res.status(400).send({ message: results.error.details[0].message });
    }
    let temp = await Appointment.find({
      $and: [{ student: RECIEVER_ID }, { jobID: JOB_ID }]
    });

    if (temp && temp.length) {
      return res.status(400).json({ message: Texts.Appointment_is_already_existed });
    }
    await Job.aggregate([
      {
        $project: {
          company_requests: {
            $filter: {
              input: '$company_requests',
              as: 'item',
              cond: {
                $gte: ['$$item.status', status]
              }
            }
          }
        }
      }
    ]).exec(async (err, data) => {
      if (err) {
        return res.status(404).send({ message: err.message });
      } else {
        let fill = data.find(fl => JOB_ID === `${fl._id}`);
        if (fill && fill.company_requests && fill.company_requests.length > 0) {
          let check = fill.company_requests.some(
            sr => sr.status === 'rejected' && `${sr.student}` === RECIEVER_ID
          );
          if (check) {
            return res.status(404).send({ message: Texts.You_have_already_sent_a_request });
          } else {
            await Job.findByIdAndUpdate(JOB_ID, {
              $push: {
                company_requests: {
                  student: RECIEVER_ID,
                  jobID: JOB_ID,
                  status: req.body.status
                }
              }
            });

            await Student.findByIdAndUpdate(
              RECIEVER_ID,
              {
                $push: {
                  notifications: {
                    title: `${company.name} ${Texts.is_sent_request_you_on_a_job}`,

                    description: `${company.name} ${Texts.is_sent_request_you_on_a_job}`
                  }
                }
              },
              { new: true }
            );
            const jobs = await Job.find().populate(populateQuery);
            if (jobs) {
              res.status(200).send({
                jobs: jobs,
                message: Texts.Request_has_been_sent_successfully
              });
            }
          }
        } else {
          await Job.findByIdAndUpdate(JOB_ID, {
            $push: {
              company_requests: {
                student: RECIEVER_ID,
                jobID: JOB_ID,
                status: req.body.status
              }
            }
          });

          await Student.findByIdAndUpdate(
            RECIEVER_ID,
            {
              $push: {
                notifications: {
                  title: `${company.name} ${Texts.is_sent_request_you_on_a_job}`,

                  description: `${company.name} ${Texts.is_sent_request_you_on_a_job}`
                }
              }
            },
            { new: true }
          );
          const jobs = await Job.find().populate(populateQuery);
          if (jobs) {
            res.status(200).send({
              jobs: jobs,
              message: Texts.Request_has_been_sent_successfully
            });
          }
        }
      }
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
    next(error);
  }
});

// recieved offer decision by company
exports.OffersRecievedDecisionByCompany = asyncHandler(async (req, res, next) => {
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
      }
    ];
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      res.status(400).send({ message: Texts.notAuthorized });
    }
    const { status } = req.body;
    const JOB_ID = req.body.id;
    const job = await Job.findById(JOB_ID);
    const SENDER_ID = job.company;
    const company = await Company.findById(SENDER_ID);
    const RECIEVER_ID = req.params.id;
    const schema = Joi.object().keys({
      status: Joi.string().valid('accepted', 'rejected'),
      id: Joi.string().required()
    });
    let results = schema.validate(req.body);
    if (results.error) {
      return res.status(400).send({ message: results.error.details[0].message });
    }
    if (status === 'accepted') {
      await Job.findOneAndUpdate(
        { _id: JOB_ID },
        { $set: { 'student_requests.$[el].status': req.body.status } },
        {
          arrayFilters: [{ 'el.student': `${RECIEVER_ID}` }],
          new: true
        }
      );

      await Student.findByIdAndUpdate(
        RECIEVER_ID,
        {
          $push: {
            notifications: {
              title: `${company.name} ${Texts.has_accepted_your_offer}`,

              description: `${company.name} ${Texts.has_accepted_your_offer}`
            }
          }
        },
        { new: true }
      );
      const jobs = await Job.find().populate(populateQuery);
      if (jobs) {
        res.status(200).send({
          jobs: jobs,
          message: Texts.Request_has_been_accepted_successfully
        });
      }
    } else {
      await Job.findOneAndUpdate(
        { _id: JOB_ID },
        { $set: { 'student_requests.$[el].status': req.body.status } },
        {
          arrayFilters: [{ 'el.student': `${RECIEVER_ID}` }],
          new: true
        }
      );

      await Student.findByIdAndUpdate(
        RECIEVER_ID,
        {
          $push: {
            notifications: {
              title: `${company.name} ${Texts.has_rejected_your_offer}`,
              description: `${company.name} ${Texts.has_rejected_your_offer}`
            }
          }
        },
        { new: true }
      );
      const jobs = await Job.find().populate(populateQuery);
      if (jobs) {
        res.status(200).send({
          jobs: jobs,
          message: Texts.Request_has_been_accepted_successfully
        });
      }
    }
  } catch (error) {
    res.status(404).send({ message: error.message });
    next(error);
  }
});

/**
 * ////////////////////////// Routes /////////////////////////
 * @author Shuja Naqvi
 */
exports.GetJobswithStudents = asyncHandler(async (req, res, next) => {
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
    const requestedUser = await User.findById(req.user.id);
    if (!requestedUser.type) {
      return res.status(400).send({ message: Texts.notAuthorized });
    } else {
      const jobs = await Job.find({ company: requestedUser.company }).populate(populateQuery);

      if (jobs.length > 0) {
        let promises = [];
        for (let i = 0; i < jobs.length; i++) {
          req.params.id = jobs[i]._id;
          promises.push(matchingCriteria.display(req, res, next));
        }

        let data = await Promise.all(promises);

        for (let i = 0; i < jobs.length; i++) {
          jobs[i]._doc.matchedStudents = data[i].students;
        }

        return res.status(200).send({ jobs: jobs, message: 'Travail récupéré avec succès' });
      } else {
        return res.status(404).send({ message: 'Non trouvé dans la base de données' });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(200).send({ message: error });
  }
});

// Get students according to the job
exports.GetMatchedStudents = asyncHandler(async (req, res, next) => {
  try {
    // Verify if user is a company
    if (req.user?.type !== 'company') {
      return res.status(400).send({ message: Texts.notAuthorized });
    }

    const { jobId } = req.params;

    // Get all jobs for the company
    let job = await Job.findOne({ _id: jobId, company: req.user?.company });
    let students = await Student.find({ isDeleted: false }).select('-score').populate('user');
    job = JSON.parse(JSON.stringify(job));
    students = JSON.parse(JSON.stringify(students));

    if (!job || !students.length) {
      return res.status(404).send({ message: 'Non trouvé dans la base de données' });
    }

    const requestedStudents = [];
    const acceptedStudents = [];
    const rejectedStudents = [];
    const studentsToBeMatched = [];

    // I know it's messed up, but efficieny is more important
    for (let i = 0; i < students.length; i++) {
      let student = students[i];

      // Check if student has applied for the job
      if (job.requests.some(studentRequest => studentRequest.student === student._id)) {
        // Check if student has been accepted or rejected
        if (
          job.requests.some(
            studentRequest =>
              studentRequest.student === student._id && studentRequest.status === 'accepted'
          )
        ) {
          acceptedStudents.push(student);
        } else if (
          job.requests.some(
            studentRequest =>
              studentRequest.student === student._id && studentRequest.status === 'rejected'
          )
        ) {
          rejectedStudents.push(student);
        } else {
          requestedStudents.push(student);
        }
      } else {
        studentsToBeMatched.push(student);
      }
    }

    // Run matching algorithm for remaining students
    const matchedStudents = await matchStudents(job, studentsToBeMatched);

    res.status(200).send({
      matchedStudents: [...matchedStudents, ...requestedStudents],
      acceptedStudents: acceptedStudents,
      rejectedStudents: rejectedStudents,
      message: 'Travail récupéré avec succès'
    });
  } catch (error) {
    console.log(error);
    return res.status(200).send({ message: 'Non trouvé dans la base de données' });
  }
});

exports.requests = asyncHandler(async (req, res, next) => {
  try {
    const { studentID, status, jobID } = req.body;

    const schema = Joi.object().keys({
      status: Joi.string().valid('accepted', 'requested', 'rejected'),
      jobID: Joi.string().required(),
      studentID: Joi.string().required()
    });
    let results = schema.validate(req.body);

    if (results.error) {
      return res.status(400).send({ message: results.error.details[0].message });
    }

    const student = await Student.findById(studentID).populate('user');
    const job = await Job.findById(jobID).populate('company');

    if (!student || !job) {
      return res.status(404).send({ message: Texts.company_not_found });
    }

    const requests = job.requests.filter(request => request.student.toString() !== studentID);

    await Job.findByIdAndUpdate(jobID, {
      $set: {
        requests: [...requests, { student: studentID, status }]
      }
    });

    // Notification
    const notification = {};
    if (status === 'requested') {
      notification.receiver = job.company._id.toString();
      notification.title = `${student.user.firstName} ${student.user.lastName}  ${Texts.student_is_applied_on_your_job}`;
      notification.message = `${student.user.firstName} ${student.user.lastName}  ${Texts.student_is_applied_on_your_job}`;
    } else if (
      status === 'rejected' &&
      req.user.type === 'company' &&
      job.requests?.some(_ => _.student === studentID && _.status === 'requested')
    ) {
      notification.receiver = studentID;
      notification.title = `${job.company.name} ${Texts.has_rejected_your_job}`;
      notification.message = `${job.company.name} ${Texts.has_rejected_your_job}`;
    }

    if (socket?.socket && notification.receiver) {
      socket.io.emit(`recieveNotification${notification.receiver}`, notification);
      await User.findByIdAndUpdate(notification.receiver, {
        $push: {
          notifications: notification
        }
      });
    }

    res.status(200).send({
      success: true,
      message: Texts.Request_has_been_sent_successfully
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
    next(error);
  }
});
