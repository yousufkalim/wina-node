const Subscription = require('../models/Subscription');

exports.isPremium = async (req, res, next) => {
  try {
    console.log(req.user);
    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription) {
      return res
        .status(400)
        .json({ success: false, subscribed: false, message: "You haven't bought a subscription" });
    }

    //   check if subscription is expired
    const today = new Date();
    const expireDate = new Date(subscription.expire_on);
    if (today > expireDate) {
      return res
        .status(400)
        .json({ success: false, subscribed: false, message: 'Your subscription is expired' });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
