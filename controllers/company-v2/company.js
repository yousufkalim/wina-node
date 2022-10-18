// company new dashboard controllers
const TEXT = require('../../utils/texts');
const JWT = require('jsonwebtoken');
const Company = require('../../models/Company');
const Appointment = require('../../models/Appointment');
const Student = require('../../models/Student');
const Job = require('../../models/Job');
const User = require('../../models/User');
const ENV = process.env;
const bcrypt = require('bcryptjs');

// Register company
exports.Register = async (req, res) => {
  try {
    const {
      name,
      company_type,
      address,
      siretNumber,
      website,
      groupName,
      linkedIn,
      type,
      contactPerson: { firstName, lastName, email, password, phone, positionHeld }
    } = req.body;

    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(409).send({ success: false, message: 'Email already exist' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      type
    });
    const company = await Company.create({
      name,
      company_type,
      address,
      siretNumber,
      website,
      groupName,
      linkedIn,
      contactPerson: {
        person: user._id,
        positionHeld
      }
    });
    user.company = company._id;
    await user.save();
    res.status(200).json({ success: true, message: 'Company created' });
  } catch (error) {
    console.log('error-------->', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Edit company
exports.EditCompany = async (req, res) => {
  try {
    const user = await User.findById(req.body.user._id);
    if (!user.company) {
      return res.status(404).json({ success: false, message: 'user company not exist' });
    }
    req.body.contactPerson = { person: req.body.user._id, positionHeld: req.body.positionHeld };
    const company = await Company.findByIdAndUpdate(user.company, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Company Updated', company: company });
  } catch (error) {
    console.log('error-------->', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete company
exports.DeleteCompany = async (req, res) => {
  try {
    const user = req.user;
    const requestedUser = await User.findById(user.id);
    await Company.findByIdAndUpdate(
      requestedUser.company,
      {
        isDeleted: true
      },
      { new: true }
    ).then(async () => {
      await Job.update({ company: user.company }, { $set: { isDeleted: true } }, { multi: true });
    });
    res.status(200).json({ message: 'Company deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// booking coaching appointments
exports.bookCoachingAppointment = async (req, res) => {
  try {
    const studentId = req.params.id;
    const timeSlots = req.body.time;
    const jobId = req.body.id;
    const userId = await Student.findById(studentId);
    const companyId = req.user.company;

    const result = await Appointment.find({
      $and: [{ student: studentId }, { jobID: jobId }]
    });
    if (result && result.length) {
      return res.status(409).json({ message: 'Appointment already exist' });
    }
    const appointment = new Appointment({
      company: companyId,
      student: studentId,
      timings: timeSlots,
      jobID: jobId
    });
    appointment.save();
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        appointments: appointment._id
      }
    });
    res.status(200).json({ success: true, message: 'Appointment created successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// search for students
exports.StudentsSearch = async (req, res) => {
  try {
  } catch (error) {
    console.log('------>', error.message);
  }
};
