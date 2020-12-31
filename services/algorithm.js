const asyncHandler = require("../middlewares/async");
const User = require("../models/User");
const Job = require("../models/Job");
const Student = require("../models/Student");

class MatchingAlgo {
  async dealBreaker(fun, req, res, next) {
    const jobs = await Job.find({ isDeleted: false });
    const user = req.user;
    const student = await Student.findById(user.student);

    // Starting Date //
    function startingDate() {
      console.log(student);
    }

    // Function calls //
    switch (fun) {
      case "startingDate":
        startingDate();
        break;
    }
  }
}

module.exports = new MatchingAlgo();
