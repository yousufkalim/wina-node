const User = require('../models/User');
module.exports = {
  addNotifcation
};

async function addNotifcation(data) {
  try {
    await User.findByIdAndUpdate(
      data.id,
      {
        $push: {
          notifications: {
            title: data.title,
            description: data.message
          }
        }
      },
      { new: true }
    );

    return 'Added';
  } catch (e) {
    return 'Error Adding: ' + e;
  }
}
