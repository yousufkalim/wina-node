const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  general_Presentation: {
    type: String,
    required: false,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  presentation_Video: {
    video: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["Approved", "Pending"],
      required: false,
    },
    required: false,
  },

  professional_Picture: {
    image: {
      type: String,
      required: false,
      default: "default.jpg",
    },
    status: {
      type: String,
      enum: ["Approved", "Pending"],
      default: "Approved",
      required: false,
    },
    required: false,
  },

  professional_networks: {
    linkedIn: {
      type: String,
      required: false,
    },
    Behance: {
      type: String,
      required: false,
    },
    Dribble: {
      type: String,
      required: false,
    },
    Github: {
      type: String,
      required: false,
    },
  },

  education: [
    {
      school: {
        type: String,
        required: false,
      },
      end_Date: {
        type: String,
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
    },
  ],

  professional_profile: [
    {
      position: {
        type: String,
        required: false,
      },
      company: {
        type: String,
        required: false,
      },
      duration: {
        start_date: { type: String, required: false },
        end_date: { type: String, required: false },
      },
      description: {
        type: String,
        required: false,
      },
    },
  ],

  resume: {
    type: String,
    required: false,
  },

  languages: [
    {
      name: { type: String, Required: false },
      skill: {
        type: String,
        enum: ["beginner", "intermediate", "fluent", "native"],
      },
    },
  ],

  isDeleted: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Student", StudentSchema);
