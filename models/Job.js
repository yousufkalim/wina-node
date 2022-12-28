const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['open', 'filled'],
    default: 'open'
  },
  // TODO: urani hai
  student_requests: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: false
      },
      jobID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: false
      },

      status: {
        type: String,
        enum: ['requested', 'rejected', 'accepted'],
        default: 'pending'
      }
    }
  ],
  // TODO: urani hai
  company_requests: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: false
      },
      jobID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: false
      },
      status: {
        type: String,
        enum: ['requested', 'rejected', 'accepted'],
        default: 'pending'
      }
    }
  ],
  requests: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: false
      },
      status: {
        type: String,
        enum: ['requested', 'accepted', 'rejected'],
        default: 'requested'
      }
    }
  ],
  domain: {
    type: String,
    required: false
  },
  score: {
    type: Number,
    required: false,
    default: 0
  },
  position: {
    type: String,
    required: false
  },
  startDate: {
    type: Date,
    required: false
  },
  duration: {
    type: String,
    required: false
  },
  location: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    zip: { type: String, required: false },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false }
  },
  photo: {
    image: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: ['None', 'Validated', 'To be Validated'],
      default: 'Validated',
      required: false
    },
    required: false
  },
  alternationRhythm: {
    type: String,
    required: false
  },
  levelOfEducation: {
    type: String,
    enum: [
      'Brevet',
      'CAP',
      'BEP',
      'MC',
      'BacGénéral',
      'BacProfessionel',
      'BTS',
      'DUT',
      'Licence',
      'Master',
      'Doctorat'
    ]
  },
  ageRange: {
    type: String,
    enum: ['18-20', '21-24', '25+'],
    default: '18-20'
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: false
    }
  ],
  InterestedStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: false
    }
  ],

  softSkills: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: false
    }
  ],
  hardSkills: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: false
    }
  ],

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', JobSchema);
