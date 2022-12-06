/**
 * Packages
 * @author Shuja Naqvi
 */
const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema(
  {
    title: String,
    price: Number,
    validity: { type: String, enum: ['Monthly', 'Yearly', 'Quarterly'] },
    detail: String,
    type: { type: String, enum: ['Student', 'Company'] },
    photo: String
  },
  {
    timestamps: true
  }
); //

module.exports = mongoose.model('Package', PackageSchema);
