/**
 * Interview controllers
 * @author Shuja Naqvi
 */

const requestPromise = require('request-promise');
const jwt = require('jsonwebtoken');
const Interviews = require('../models/interview');
const Company = require('../models/Company');
const Student = require('../models/Student');
const Job = require('../models/Job');
const Appointment = require('../models/Appointment');
const { interviewInvitation } = require('../utils/sendEmail');
const { Texts } = require('../utils/texts');
const User = require('../models/User');
const socket = require('../app');
const moment = require('moment');
/**
 * Create Virtual Interview
 * @param {object} req
 * @param {object} res
 */
exports.virtualInterview = async (req, res) => {
  try {
    const { description, student, job, company, start_date } = req.body;

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
            //to add company request and to send notification to user for interview
            companyRequest(student, job, existingCompany, existingStudent)
              .then(async data => {
                if (socket?.socket) {
                  socket.io.emit(`recieveNotification${existingStudent.user._id}`, {
                    title: 'invitation à un entretien',
                    message: `Vous avez été invité à un entretien en ligne par ${
                      existingCompany.name
                    } le ${moment(start_date).format('DD/MM/YYYY hh:mm:ss a')}  `,
                    link: `${mail.guest_link}`
                  });
                }
                await User.findByIdAndUpdate(
                  existingStudent.user._id,
                  {
                    $push: {
                      notifications: {
                        title: 'invitation à un entretien',
                        description: `Vous avez été invité à un entretien en ligne par ${
                          existingCompany.name
                        } le ${moment(start_date).format('DD/MM/YYYY hh:mm:ss a')}  `,
                        link: `${mail.guest_link}`
                      }
                    }
                  },
                  { new: true }
                );
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
                  })
                  .populate('job');
                res.status(200).json({
                  success: true,
                  message: "L'entretien a été programmé",
                  notification: data.message,
                  interview: interviews
                });
              })
              .catch(err => {
                console.log('Error ----> ', err);
                res.status(500).json({ success: false, message: err.message });
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
    const { student, company, job, description, start_date } = req.body;
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
        //to add company request and to send notification to user for interview
        await companyRequest(student, job, existingCompany, existingStudent)
          .then(async data => {
            if (socket?.socket) {
              socket.io.emit(`recieveNotification${existingStudent.user._id}`, {
                title: 'invitation à un entretien',
                message: `Vous avez été invité à un entretien sur site par ${
                  existingCompany.name
                } le ${moment(start_date).format('DD/MM/YYY hh:mm:ss a')}`
              });
            }
            await User.findByIdAndUpdate(
              existingStudent.user._id,
              {
                $push: {
                  notifications: {
                    title: 'invitation à un entretien',
                    description: `Vous avez été invité à un entretien sur site par ${
                      existingCompany.name
                    } le ${moment(start_date).format('DD/MM/YYY hh:mm:ss a')}`
                  }
                }
              },
              { new: true }
            );
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
              })
              .populate('job');
            res.status(200).json({
              success: true,
              message: "L'entretien a été programmé",
              notification: data.message,
              interview: interviews
            });
          })
          .catch(err => {
            res.status(500).json({ success: false, message: err.message });
          });
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
      })
      .populate('job');
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
      })
      .populate('job');
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
      })
      .populate('job');
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
      })
      .populate('job');
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
    if (new Date(start_date) === new Date(interview.start_date)) {
      await Interviews.findByIdAndUpdate(interviewId, req.body, { new: true })
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
        .json({ success: true, message: "L'entretien a été mis à jour", interview: interviews });
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
          if (socket?.socket) {
            socket.io.emit(`recieveNotification${existingStudent.user._id}`, {
              title: 'invitation à un entretien',
              message: `Vous avez été invité à un entretien en ligne par ${
                existingCompany.name
              } le ${moment(start_date).format('DD/MM/YYYY hh:mm:ss a')}  `,
              link: `${mail.guest_link}`
            });
          }
          await User.findByIdAndUpdate(
            existingStudent.user._id,
            {
              $push: {
                notifications: {
                  title: 'invitation à un entretien',
                  description: `Vous avez été invité à un entretien en ligne par ${
                    existingCompany.name
                  } le ${moment(start_date).format('DD/MM/YYYY hh:mm:ss a')}`,
                  link: `${mail.guest_link}`
                }
              }
            },
            { new: true }
          );
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
          return res.status(200).json({
            success: true,
            message: "L'entretien a été mis à jour",
            interview: interviews
          });
        });
      });
    } else if (interview.type === 'physical') {
      const { interviewId } = req.params;
      await Interviews.findByIdAndUpdate(interviewId, req.body, { new: true })
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
        if (socket?.socket) {
          socket.io.emit(`recieveNotification${existingStudent.user._id}`, {
            title: 'invitation à un entretien',
            message: `Vous avez été invité à un entretien sur site par ${
              existingCompany.name
            } le ${moment(start_date).format('DD/MM/YYYY hh:mm:ss a')}`
          });
        }
        await Student.findByIdAndUpdate(
          existingStudent._id,
          {
            $push: {
              notifications: {
                title: 'invitation à un entretien',
                description: `Vous avez été invité à un entretien sur site par ${
                  existingCompany.name
                }  ${moment(start_date).format('DD/MM/YYYY hh:mm:ss a')} `
              }
            }
          },
          { new: true }
        );
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
          .json({ success: true, message: "L'entretien a été mis à jour", interview: interviews });
      });
    }
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const companyRequest = (RECIEVER_ID, JOB_ID, companyData, studentData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const status = 'requested';
      let temp = await Appointment.find({
        $and: [{ student: RECIEVER_ID }, { jobID: JOB_ID }]
      });

      if (temp && temp.length) {
        reject({ success: false, message: Texts.Appointment_is_already_existed });
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
          reject({ success: false, message: err.message });
        } else {
          let fill = data.find(fl => JOB_ID === `${fl._id}`);
          if (fill && fill.company_requests && fill.company_requests.length > 0) {
            // let check = fill.company_requests.some(
            //   sr => sr.status === 'requested' && `${sr.student}` === RECIEVER_ID
            // );
            // if (check) {
            // reject({ success: false, message: Texts.You_have_already_sent_a_request });
            // } else {
            // const notifications = {
            //   title: `${companyData.name} ${Texts.is_sent_request_you_on_a_job}`,

            //   description: `${companyData.name} ${Texts.is_sent_request_you_on_a_job}`
            // };
            await Job.findByIdAndUpdate(JOB_ID, {
              $push: {
                company_requests: {
                  student: RECIEVER_ID,
                  jobID: JOB_ID,
                  status: status
                }
              }
            });
            // studentData.notifications.push(notifications);
            // await studentData.save();
            resolve({ success: true, message: 'Requested Successfully' });
            // }
          } else {
            await Job.findByIdAndUpdate(JOB_ID, {
              $push: {
                company_requests: {
                  student: RECIEVER_ID,
                  jobID: JOB_ID,
                  status: status
                }
              }
            });
            // const notifications = {
            //   title: `${companyData.name} ${Texts.is_sent_request_you_on_a_job}`,
            //   jobID: JOB_ID,
            //   description: `${companyData.name} ${Texts.is_sent_request_you_on_a_job}`
            // };
            // studentData.notifications.push(notifications);
            // await studentData.save();
            resolve({ success: true, message: 'Requested Successfully' });
          }
        }
      });
    } catch (err) {
      reject({ success: false, message: 'Interval Server error' });
    }
  });
};
