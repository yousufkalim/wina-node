/**
 * Subscription controllers
 * @author Shuja Naqvi
 */

const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const Student = require('../models/Student');
const Package = require('../models/packages');
const cron = require('node-cron');
const mongoose = require('mongoose');
/**
 * Create New  Subscription
 * @param {object} req
 * @param {object} res
 */

exports.create = async (req, res) => {
  try {
    const { package, user } = req.body;
    const existingPackage = await Package.findById(package);
    if (!existingPackage) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    if (user.type === 'company') {
      const existingCompany = await Company.findById(user.uId);
      if (!existingCompany) {
        return res.status(404).json({ success: false, message: 'user not found' });
      }
    } else if (user.type === 'student') {
      const existingStudent = await Student.findById(user.uId);
      if (!existingStudent) {
        return res.status(404).json({ success: false, message: 'user not found' });
      }
    } else {
      return res.status(404).json({ success: false, message: 'invalid type' });
    }

    const existingSubscription = await Subscription.findOne({
      'user.uId': user.uId,
      expired: false
    });
    if (existingSubscription) {
      return res
        .status(404)
        .json({ success: false, message: 'sorry you cant subscribe mutilple packages at a time' });
    }
    Subscription.create(req.body).then(subscribe => {
      res
        .status(200)
        .json({ success: true, message: 'You have subscribed successfully', subscribe });
    });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * get all subscriptions
 * @param {object} req
 * @param {object} res
 */

exports.getAll = async (req, res) => {
  try {
    const subscriptions = await Subscription.aggregate([
      {
        $lookup: {
          from: 'packages',
          localField: 'package',
          foreignField: '_id',
          as: 'package'
        }
      },
      {
        $unwind: {
          path: '$package',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'user.uId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: {
          path: '$student',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'student.user',
          foreignField: '_id',
          as: 'student.user'
        }
      },
      {
        $unwind: {
          path: '$student.user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'user.uId',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $unwind: {
          path: '$company',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'company.contactPerson.person',
          foreignField: '_id',
          as: 'company.contactPerson.person'
        }
      },
      {
        $unwind: {
          path: '$company.contactPerson.person',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$user.type',
          result: {
            $push: {
              package: '$package',
              company: '$company',
              student: '$student'
            }
          }
        }
      }
    ]);
    res.status(200).json({ success: true, subscriptions });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * get subscription by id
 * @param {object} req
 * @param {object} res
 */

exports.getById = async (req, res) => {
  try {
    let { subscriptionId } = req.params;
    subscriptionId = mongoose.Types.ObjectId(subscriptionId);
    let data = await Subscription.findById(subscriptionId).populate('package');
    if (data) {
      data = { ...data._doc };
      if (data.user.type === 'company') {
        data.company = await Company.findById(data.user.uId).populate('contactPerson.person');
        return res.status(200).json({ success: true, subscription: data });
      } else if (data.user.type === 'student') {
        data.student = await Student.findById(data.user.uId).populate('user');
        return res.status(200).json({ success: true, subscription: data });
      }
    } else {
      return res.status(200).json({ success: true, subscription: {} });
    }
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * get by user
 * @param {object} req
 * @param {object} res
 */

exports.getByUser = async (req, res) => {
  try {
    const { userId, type } = req.query;
    if (!type && !userId) {
      return res.status(404).json({ success: false, message: 'Type and UserId required' });
    }
    const user = mongoose.Types.ObjectId(userId);
    if (type === 'company') {
      const data = await Subscription.aggregate([
        { $match: { 'user.uId': user } },
        {
          $lookup: {
            from: 'packages',
            localField: 'package',
            foreignField: '_id',
            as: 'package'
          }
        },
        {
          $unwind: {
            path: '$package',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'companies',
            localField: 'user.uId',
            foreignField: '_id',
            as: 'company'
          }
        },
        {
          $unwind: {
            path: '$company',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'company.contactPerson.person',
            foreignField: '_id',
            as: 'company.contactPerson.person'
          }
        },
        {
          $unwind: {
            path: '$company.contactPerson.person',
            preserveNullAndEmptyArrays: true
          }
        }
      ]);
      res.status(200).json({ success: true, subscription: data });
    } else if (type === 'student') {
      const data = await Subscription.aggregate([
        { $match: { 'user.uId': user } },
        {
          $lookup: {
            from: 'packages',
            localField: 'package',
            foreignField: '_id',
            as: 'package'
          }
        },
        {
          $unwind: {
            path: '$package',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'students',
            localField: 'user.uId',
            foreignField: '_id',
            as: 'student'
          }
        },
        {
          $unwind: {
            path: '$student',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'student.user',
            foreignField: '_id',
            as: 'student.user'
          }
        },
        {
          $unwind: {
            path: '$student.user',
            preserveNullAndEmptyArrays: true
          }
        }
      ]);
      res.status(200).json({ success: true, subscription: data });
    } else {
      return res.status(404).json({ success: false, message: 'Invalid Type' });
    }
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//cron-job that will run after every  hours  to notify drivers regarding upcomming rides(24 hours)
cron.schedule('0 11 * * *', async () => {
  try {
    const timeNow = new Date();
    await Subscription.findAndUpdate(
      { expire_on: { $lte: timeNow } },
      { expired: true },
      { new: true }
    );
  } catch (err) {
    console.log(err.message);
  }
});
