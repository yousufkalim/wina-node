const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  title: String,
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  host_link: String,
  guest_link: String,
  start_date: Date
});

module.exports = mongoose.model('Skill', SkillSchema);
