/**
 * Subscription
 * @author Shuja Naqvi
 */
const mongoose = require('mongoose');

const subcriptionSchema = new mongoose.Schema(
  {
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expire_on: Date,
    expired: {
      type: Boolean,
      default: false
    },
    price: Number
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Subscription', subcriptionSchema);
