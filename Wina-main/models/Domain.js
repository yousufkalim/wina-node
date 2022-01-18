const mongoose = require("mongoose");

const DomainSchema = new mongoose.Schema({
  title: String,

  isDeleted: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Domain", DomainSchema);
