const asyncHandler = require("../middlewares/async");
const moment = require("moment");
const User = require("../models/User");
const Job = require("../models/Job");
const Student = require("../models/Student");

class DealBreaker {
  // Starting Date //
  startingDate = async (user, next) => {
    try {
      var filteredJobs = [];
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
      return filteredJobs;
      // res.status(200).json({ Jobs: filteredJobs });
    } catch (err) {
      next(err);
    }
  };
}

class MatchingCriteria extends DealBreaker {
  // Location //
  //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)

  location = async (req, res, next) => {
    try {
      function calcDistance(lat1, lon1, lat2, lon2) {
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

      const user = req.user;
      const student = await Student.findById(user.student);
      const latitude1 = req.user.address.latitude;
      const longitude1 = req.user.address.longitude;

      // const jobs = await Job.find({ isDeleted: false });
      const jobs = await this.startingDate(req.user, next);
      const locationFilterArray = [];
      jobs.map((job) => {
        const latitude2 = job.location.latitude;
        const longitude2 = job.location.longitude;

        const result =
          (1 -
            calcDistance(latitude1, longitude1, latitude2, longitude2) * 0.02) *
          5;
        return locationFilterArray.push({ id: job.id, score: result });
      });
    } catch (err) {
      next(err);
    }
  };

  softSkills = async (req, res, next) => {
    try {
      const user = req.user;
      const student = await Student.findById(user.student);
      const userSoftSkills = student.softSkills;
      const userHardSkills = student.hardSkills;

      const jobs = await this.startingDate(req.user, next);
      const result = jobs.filter((job) => {
        console.log(userSoftSkills, "hey1");
        console.log(job.softSkills, "hey2");
        var n = 0;
        for (let i = 0; i < userSoftSkills.length; i++) {
          // Loop for array2
          for (let j = 0; j < job.softSkills.length; j++) {
            // Compare the element of each and
            // every element from both of the
            // arrays
            if (userSoftSkills[i] == job.softSkills[j]) {
              console.log("matched1");
              // Return if common element found
              n++;
            }
            return n;
          }
        }
      });
    } catch (err) {
      next(err);
    }
  };

  search = async (array) => {
    const loactionresutl = await this.location(array);
    const skillresult = await this.softSkills(array);

    array.map((job) => {
      const locationIndex = loactionresutl.findIndex(
        (item) => item.id === job.id
      );
      const locationValue = loactionresutl[locationIndex]; /// 4.7
      const skillIndex = skillresult.findIndex((item) => item.id === job.id);
      const skillValue = skillresult[skillIndex]; /// 4.7
    });
  };
}

module.exports = {
  MatchingCriteria,
  DealBreaker,
};
