/**
 * Interview controllers
 * @author Shuja Naqvi
 */

const requestPromise = require('request-promise');
const jwt = require('jsonwebtoken');
const Interviews = require('../models/Interview');
const Company = require('../models/Company');
const Student = require('../models/Student');
const { interviewInvitation } = require('../utils/sendEmail');
/**
 * Create Virtual Interview
 * @param {object} req
 * @param {object} res
 */
exports.virtualInterview = async (req, res) => {
  try {
    const { description, student, company, start_date } = req.body;
    const existingStudent = await Student.findById(student).populate('user');
    if (!existingStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const existingCompany = await Company.findById(company).populate('contactPerson.person');
    if (!existingCompany) {
      return res.status(404).json({ success: false, message: 'company not found' });
    }
    const payload = {
      iss: process.env.ZOOM_KEY, //your API KEY
      exp: new Date(start_date).getTime()
    };
    const token = jwt.sign(payload, process.env.ZOOM_SECRET); //your API SECRET HERE
    var options = {
      method: 'POST',
      uri: 'https://api.zoom.us/v2/users/' + process.env.ZOOM_EMAIL + '/meetings',
      body: {
        topic: description, //meeting title
        type: 2,
        settings: {
          host_video: 'true',
          participant_video: 'true'
        }
      },
      auth: {
        bearer: token
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true
    };
    requestPromise(options)
      .then(function (response) {
        // res.json(response);

        req.body.host_link = response.start_url;
        req.body.guest_link = response.join_url;
        const mail = {
          description: description,
          guest: existingStudent.user.email,
          host: existingCompany.contactPerson.person.email,
          host_link: response.start_url,
          guest_link: response.join_url,
          date: start_date
        };
        Interviews.create(req.body).then(interview => {
          interviewInvitation(mail).then(async () => {
            const interviews = await Interviews.find()
              .populate({
                path: 'student',
                populate: {
                  path: 'user',
                  model: 'User'
                }
              })
              .populate({
                path: 'company',
                populate: {
                  path: 'contactPerson.person',
                  model: 'User'
                }
              });
            res
              .status(200)
              .json({
                success: true,
                message: 'Interview has been schedule',
                interview: interviews
              });
          });
        });
      })
      .catch(function (err) {
        // API call failed...
        res.json(err.message);
        console.log('API call failed, reason ', err.message);
      });
  } catch (err) {
    // Error handling
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Create Physical Interview
 * @param {object} req
 * @param {object} res
 */

exports.physicalInterview = async (req, res) => {
  try {
    const { student, company, description, start_date } = req.body;
    const existingStudent = await Student.findById(student).populate('user');
    if (!existingStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const existingCompany = await Company.findById(company).populate('contactPerson.person');
    if (!existingCompany) {
      return res.status(404).json({ success: false, message: 'company not found' });
    }

    Interviews.create(req.body).then(interview => {
      const mail = {
        description: description,
        guest: existingStudent.user.email,
        host: existingCompany.contactPerson.person.email,
        date: start_date
      };
      interviewInvitation(mail).then(async () => {
        const interviews = await Interviews.find()
          .populate({
            path: 'student',
            populate: {
              path: 'user',
              model: 'User'
            }
          })
          .populate({
            path: 'company',
            populate: {
              path: 'contactPerson.person',
              model: 'User'
            }
          });
        res
          .status(200)
          .json({ success: true, message: 'Interview has been schedule', interview: interviews });
      });
    });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * get interviews
 * @param {object} req
 * @param {object} res
 */

exports.getInterviews = async (req, res) => {
  try {
    const { studentId, companyId } = req.params;
    const interviews = await Interviews.find({ student: studentId, company: companyId })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          model: 'User'
        }
      })
      .populate({
        path: 'company',
        populate: {
          path: 'contactPerson.person',
          model: 'User'
        }
      });
    res.status(200).json({ success: true, interviews });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * get by id
 * @param {object} req
 * @param {object} res
 */

exports.getById = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interviews.findById(interviewId)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          model: 'User'
        }
      })
      .populate({
        path: 'company',
        populate: {
          path: 'contactPerson.person',
          model: 'User'
        }
      });
    // .populate('company');
    res.status(200).json({ success: true, interview });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * get by companyid
 * @param {object} req
 * @param {object} res
 */

exports.getByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const interviews = await Interviews.find({ company: companyId })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          model: 'User'
        }
      })
      .populate({
        path: 'company',
        populate: {
          path: 'contactPerson.person',
          model: 'User'
        }
      });
    res.status(200).json({ success: true, interviews });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * get by student id
 * @param {object} req
 * @param {object} res
 */

exports.getByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const interviews = await Interviews.find({ student: studentId })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          model: 'User'
        }
      })
      .populate({
        path: 'company',
        populate: {
          path: 'contactPerson.person',
          model: 'User'
        }
      });
    res.status(200).json({ success: true, interviews });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * update student
 * @param {object} req
 * @param {object} res
 */

exports.update = async (req, res) => {
  try {
    if (req.body.type) {
      return res.status(404).json({ success: false, message: 'You cant update interview type' });
    }
    const { description, student, company, start_date } = req.body;
    const { interviewId } = req.params;
    const interview = await Interviews.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    const existingStudent = await Student.findById(student).populate('user');
    if (!existingStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const existingCompany = await Company.findById(company).populate('contactPerson.person');
    if (!existingCompany) {
      return res.status(404).json({ success: false, message: 'company not found' });
    }
    if (new Date(start_date) === new Date(interview)) {
      const interview = await Interviews.findByIdAndUpdate(interviewId, req.body, { new: true })
        .populate({
          path: 'student',
          populate: {
            path: 'user',
            model: 'User'
          }
        })
        .populate({
          path: 'company',
          populate: {
            path: 'contactPerson.person',
            model: 'User'
          }
        });
      const interviews = await Interviews.find()
        .populate({
          path: 'student',
          populate: {
            path: 'user',
            model: 'User'
          }
        })
        .populate({
          path: 'company',
          populate: {
            path: 'contactPerson.person',
            model: 'User'
          }
        });
      return res
        .status(200)
        .json({ success: true, message: 'Interview has been updated', interview: interviews });
    }
    if (interview.type === 'virtual') {
      const payload = {
        iss: process.env.ZOOM_KEY, //your API KEY
        exp: new Date(start_date).getTime()
      };
      const token = jwt.sign(payload, process.env.ZOOM_SECRET); //your API SECRET HERE
      var options = {
        method: 'POST',
        uri: 'https://api.zoom.us/v2/users/' + process.env.ZOOM_EMAIL + '/meetings',
        body: {
          topic: description, //meeting title
          type: 2,
          settings: {
            host_video: 'true',
            participant_video: 'true'
          }
        },
        auth: {
          bearer: token
        },
        headers: {
          'User-Agent': 'Zoom-api-Jwt-Request',
          'content-type': 'application/json'
        },
        json: true
      };
      requestPromise(options).then(async function (response) {
        // res.json(response);
        req.body.host_link = response.start_url;
        req.body.guest_link = response.join_url;
        const mail = {
          description: description,
          guest: existingStudent.user.email,
          host: existingCompany.contactPerson.person.email,
          host_link: response.start_url,
          guest_link: response.join_url,
          date: start_date
        };
        const { interviewId } = req.params;
        const interview = await Interviews.findByIdAndUpdate(interviewId, req.body, { new: true })
          .populate({
            path: 'student',
            populate: {
              path: 'user',
              model: 'User'
            }
          })
          .populate({
            path: 'company',
            populate: {
              path: 'contactPerson.person',
              model: 'User'
            }
          });
        interviewInvitation(mail).then(async () => {
          const interviews = await Interviews.find()
            .populate({
              path: 'student',
              populate: {
                path: 'user',
                model: 'User'
              }
            })
            .populate({
              path: 'company',
              populate: {
                path: 'contactPerson.person',
                model: 'User'
              }
            });
          return res
            .status(200)
            .json({ success: true, message: 'Interview has been updated', interview: interviews });
        });
      });
    } else if (interview.type === 'physical') {
      const { interviewId } = req.params;
      const interview = await Interviews.findByIdAndUpdate(interviewId, req.body, { new: true })
        .populate({
          path: 'student',
          populate: {
            path: 'user',
            model: 'User'
          }
        })
        .populate({
          path: 'company',
          populate: {
            path: 'contactPerson.person',
            model: 'User'
          }
        });
      const mail = {
        description: description,
        guest: existingStudent.user.email,
        host: existingCompany.contactPerson.person.email,
        date: start_date
      };
      interviewInvitation(mail).then(async () => {
        const interviews = await Interviews.find()
          .populate({
            path: 'student',
            populate: {
              path: 'user',
              model: 'User'
            }
          })
          .populate({
            path: 'company',
            populate: {
              path: 'contactPerson.person',
              model: 'User'
            }
          });
        res
          .status(200)
          .json({ success: true, message: 'Interview has been schedule', interview: interviews });
      });
    }
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
