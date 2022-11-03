/**
 * Interview
 * @author Shuja Naqvi
 */
const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: false
  },
  description: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'rejected', 'attended', 'accepted'],
    default: 'pending'
  },
  type: { type: String, enum: ['virtual', 'physical'] },
  host_link: String,
  guest_link: String,
  start_date: Date
});

module.exports = mongoose.model('Interview', InterviewSchema);
