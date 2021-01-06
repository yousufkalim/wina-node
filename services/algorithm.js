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

      const softSkillsArray = [];
      var n = 0;
      var score = 0;
      const jobs = await this.startingDate(req.user, next);

      const result = jobs.filter((job) => {
        n = 0;
        userSoftSkills.map((item) => {
          job.softSkills.map((item1) => {
            if (item.toString() == item1.toString()) {
              n++;
            }
          });
        });
        if (n == 0) {
          score = 0;
        } else if (n == 1) {
          score = 0.5;
        } else if (n == 2) {
          score = 0.8;
        } else if (n == 3) {
          score = 1;
        }
        score = score * 15;
        return softSkillsArray.push({ id: job.id, score: score });
      });
      console.log(softSkillsArray);
    } catch (err) {
      next(err);
    }
  };

  hardSkills = async (req, res, next) => {
    try {
      const user = req.user;
      const student = await Student.findById(user.student);
      const userHardSkills = student.hardSkills;

      const hardSkillsArray = [];
      var n = 0;
      var score = 0;
      const jobs = await this.startingDate(req.user, next);

      const result = jobs.filter((job) => {
        n = 0;
        userHardSkills.map((item) => {
          job.hardSkills.map((item1) => {
            if (item.toString() == item1.toString()) {
              n++;
            }
          });
        });
        if (n == 0) {
          score = 0;
        } else if (n == 1) {
          score = 0.5;
        } else if (n == 2) {
          score = 0.8;
        } else if (n == 3) {
          score = 1;
        }
        score = score * 20;
        return hardSkillsArray.push({ id: job.id, score: score });
      });
      console.log(hardSkillsArray);
    } catch (err) {
      next(err);
    }
  };

  field = async (req, res, next) => {
    try {
      const user = req.user;
      const student = await Student.findById(user.student);
      const studentField = student.positionSought.domain;

      let score = 0;
      let fieldArray = [];
      const jobs = await this.startingDate(req.user, next);
      jobs.map((job) => {
        if (job.domain === studentField) {
          score = 1;
        } else {
          score = 0;
        }
        score = score * 35;
        return fieldArray.push({ id: job.id, score: score });
      });
      console.log(fieldArray);
    } catch (err) {
      next(err);
    }
  };

  jobName = async (req, res, next) => {
    try {
      const user = req.user;
      const student = await Student.findById(user.student);
      const studentPosition = student.positionSought.position.toUpperCase();

      let score = 0;
      let jobNameArray = [];

      const jobs = await this.startingDate(req.user, next);

      jobs.map((job) => {
        const jobTitle = job.title.toUpperCase();
        const result = studentPosition.localeCompare(jobTitle);
        if (result === 0) {
          score = 1;
        } else {
          score = 0;
        }
        score = score * 4;
        return jobNameArray.push({ id: job.id, score: score });
      });
      console.log(jobNameArray);
    } catch (err) {
      next(err);
    }
  };

  // Starting Date //
  startDate = async (req, res, next) => {
    try {
      const user = req.user;
      const student = await Student.findById(user.student);
      const studentStartingDate = moment(
        student.positionSought.startDate,
        "MM-DD-YYYY"
      );

      const jobs = await this.startingDate(req.user, next);
      var startDateArray = [];
      let score = 0;

      jobs.map((job) => {
        const jobDate = moment(job.startDate, "MM-DD-YYYY");
        const result = Math.abs(studentStartingDate.diff(jobDate, "weeks"));
        if (result <= 1) {
          score = 1;
        } else if (result > 1 && result <= 2) {
          score = 0.8;
        } else if (result > 2 && result <= 4) {
          score = 0.3;
        } else if (result > 4) {
          score = 0;
        }
        score = score * 5;
        return startDateArray.push({ id: job.id, score: score });
      });
      console.log(startDateArray);
      // res.status(200).json({ Jobs: filteredJobs });
    } catch (err) {
      next(err);
    }
  };

  lengthOfTheAlternate = async (req, res, next) => {
    try {
      const user = req.user;
      const student = await Student.findById(user.student);
      const studentDuration = student.positionSought.duration.split(" ");

      const jobs = await this.startingDate(req.user, next);
      var lengthOfTheAlternateArray = [];
      let score = 0;

      jobs.map((job) => {
        const jobDuration = job.duration.split(" ");
        const result = studentDuration[0] - jobDuration[0];
        if (result == 0) {
          score = 1;
        } else if (result == 1) {
          score = 0.4;
        } else if (result > 1) {
          score = 0;
        }
        score = score * 5;
        return lengthOfTheAlternateArray.push({ id: job.id, score: score });
      });
      console.log(lengthOfTheAlternateArray);
    } catch (err) {
      next(err);
    }
  };

  levelOfEducation = async (req, res, next) => {
    try {
      const user = req.user;
      const student = await Student.findById(user.student);
      const studentEducation = student.positionSought.levelOfEducation.split(
        ":"
      );

      console.log(studentEducation[0]);

      // const jobs = await this.startingDate(req.user, next);
      // var lengthOfTheAlternateArray = [];
      // let score = 0;

      // jobs.map((job) => {
      //   const jobDuration = job.duration.split(" ");
      //   const result = studentDuration[0] - jobDuration[0];
      //   if (result == 0) {
      //     score = 1;
      //   } else if (result == 1) {
      //     score = 0.4;
      //   } else if (result > 1) {
      //     score = 0;
      //   }
      //   score = score * 5;
      //   return lengthOfTheAlternateArray.push({ id: job.id, score: score });
      // });
      // console.log(lengthOfTheAlternateArray);
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
