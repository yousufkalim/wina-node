const asyncHandler = require("../middlewares/async");
const moment = require("moment");
const User = require("../models/User");
const Job = require("../models/Job");
const Student = require("../models/Student");

class MatchingAlgo {
  async dealBreaker(fun, req, res, next) {
    try {
      var filteredJobs = [];

      // Starting Date //
      async function startingDate() {
        const user = req.user;
        const student = await Student.findById(user.student);
        const studentStartingDate = moment(
          student.positionSought.startDate,
          "MM-DD-YYYY"
        );

        const jobs = await Job.find({ isDeleted: false });

        jobs.map((item) => {
          const jobDate = moment(item.startDate, "MM-DD-YYYY");
          const result = Math.abs(studentStartingDate.diff(jobDate, "months"));
          if (result <= 4) {
            filteredJobs.push(item);
          }
        });
        res.status(200).json({ Jobs: filteredJobs });
      }

      // Function calls for DealBreaker//
      switch (fun) {
        case "startingDate":
          startingDate();
          break;
      }
    } catch (err) {
      next(err);
    }
  }

  async matchingCriteria(fn, req, res, next) {
    try {
      // Location //
      //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
      function calcCrow(lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = toRad(lat2 - lat1);
        var dLon = toRad(lon2 - lon1);
        var lat1 = toRad(lat1);
        var lat2 = toRad(lat2);

        var a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) *
            Math.sin(dLon / 2) *
            Math.cos(lat1) *
            Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
      }

      // Converts numeric degrees to radians
      function toRad(Value) {
        return (Value * Math.PI) / 180;
      }
      async function location() {
        const user = req.user;
        const student = await Student.findById(user.student);
      }

      // Function calls for Matching Criteria //
      switch (fun) {
        case "startingDate":
          startingDate();
          break;
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MatchingAlgo();
