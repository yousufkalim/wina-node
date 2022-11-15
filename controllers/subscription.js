/**
 * Subscription controllers
 * @author Shuja Naqvi
 */

const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const Student = require('../models/Student');
const Package = require('../models/packages');
const cron = require('node-cron');
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
    const subscriptions = await Subscription.find();
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
    const { subscriptionId } = req.params;
    const subscription = await Subscription.findById(subscriptionId);
    res.status(200).json({ success: true, subscription });
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
    const { userId } = req.params;
    const subscriptions = await Subscription.find({ 'user.uId': userId });
    res.status(200).json({ success: true, subscriptions });
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
