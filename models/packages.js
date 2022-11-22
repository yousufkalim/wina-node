/**
 * Packages
 * @author Shuja Naqvi
 */
const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema(
  {
    title: String,
    price: Number,
    type: { type: String, enum: ['1 Month', '3 Months', '6 Months', '12 Months'] },
    detail: String,
    photo: String
  },
  {
    timestamps: true
  }
); //

module.exports = mongoose.model('Package', PackageSchema);
