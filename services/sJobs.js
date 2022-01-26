const asyncHandler = require("../middlewares/async");
const moment = require("moment");
const User = require("../models/User");
const Job = require("../models/Job");
const Student = require("../models/Student");
const Skill = require("../models/Skill");
const { Promise } = require("mongoose");

class DealBreaker {
  // Starting Date //
  startingDate = async (user, next) => {
    try {
      var filteredJobs = [];
      console.log("Inside starting date");
      const student = await Student.findById(user.student);
      console.log("Found Std");
      const studentStartingDate = moment(
        student.positionSought.startDate,
        "YYYY-MM-DD"
      );
      console.log("SET STD starting date");
      const jobs = await Job.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(30);
      jobs.map((item) => {
        const jobDate = moment(item.startDate, "YYYY-MM-DD");
        const result = Math.abs(studentStartingDate.diff(jobDate, "months"));
        console.log("Result", result);
        if (result <= 200) {
          filteredJobs.push(item);
        }
      });
      console.log("I found filtered Jobs");
      return filteredJobs;
      // res.status(200).json({ Jobs: filteredJobs });
    } catch (err) {
      return res.status(200).json({ message: err.message });
    }
  };
}

class MatchingCriteria extends DealBreaker {
  // Location //
  //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
  location = async (user, jobs) => {
    console.log("Inside Location");
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
    const latitude1 = user.address.latitude;
    const longitude1 = user.address.longitude;
    const locationFilterArray = [];
    jobs.map((job) => {
      const latitude2 = job.location.latitude;
      const longitude2 = job.location.longitude;
      const result =
        (1 -
          calcDistance(latitude1, longitude1, latitude2, longitude2) * 0.02) *
        5;
      if (isNaN(result) == false && result > 0) {
        return locationFilterArray.push({ id: job.id, score: result });
      }
    });
    console.log("FilteredArray", locationFilterArray);
    return locationFilterArray;
  };
  softSkills = async (user, jobs) => {
    const student = await Student.findById(user.student);
    console.log("Finding skils");
    const skill = await Skill.find({ skillType: "Soft Skill" });
    console.log("found");
    const userSoftSkills = student.softSkills;
    const softSkillsArray = [];
    var n = 0;
    var score = 0;
    const result = jobs.filter((job) => {
      if (job.softSkills != null) {
        n = 0;
        userSoftSkills.map(async (item) => {
          job.softSkills.map(async (item1) => {
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
        if (score > 0)
          return softSkillsArray.push({ id: job.id, score: score });
      } else if (job.softSkills == null) {
        console.log(job.softSkills, "Null softSkills");
        job.title.map((item) => {
          skill.map(async (item1) => {
            if (item.toString() == item1.wordCheck.toString()) {
              item.softSkills.push(item1.id);
              await item.save();
            }
          });
        });
        if (job.softSkills !== null) {
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
          score = score * 20;
          if (score > 0)
            return softSkillsArray.push({ id: job.id, score: score });
        }
      } else {
        score = 0.5 * 20;
        return softSkillsArray.push({ id: job.id, score: score });
      }
    });
    console.log(softSkillsArray, "SoftSkills");
    return softSkillsArray;
  };
  hardSkills = async (user, jobs) => {
    const student = await Student.findById(user.student);
    console.log("Finding skils");
    const skill = await Skill.find({ skillType: "Hard Skill" });
    console.log("found");
    const userHardSkills = student.hardSkills;
    const hardSkillsArray = [];
    var n = 0;
    var score = 0;
    const result = jobs.filter((job) => {
      if (job.hardSkills.length > 0) {
        console.log("JOBS", job.hardSkills);
        console.log("Inside hard Skills not null part", job.hardSkills);
        n = 0;
        userHardSkills.map(async (item) => {
          job.hardSkills.map(async (item1) => {
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
        if (score > 0)
          return hardSkillsArray.push({ id: job.id, score: score });
      } else {
        console.log("Inside hard Skills null part");
        jobs.map((item) => {
          if (item.title != undefined) {
            skill.map(async (item1) => {
              if (item1.wordCheck != undefined || item1.wordCheck != null) {
                if (item.title.toString() == item1.wordCheck.toString()) {
                  console.log("Matched");
                  item.hardSkills.push(item1.id);
                  await item.save();
                }
              }
            });
          }
        });
        if (job.hardSkills.length > 0) {
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
          if (score > 0)
            return hardSkillsArray.push({ id: job.id, score: score });
        }
      }
    });
    console.log(hardSkillsArray, "HardSkills");
    return hardSkillsArray;
  };
  field = async (user, jobs) => {
    const student = await Student.findById(user.student);
    const studentField = student.positionSought.domain;
    let score = 0;
    let fieldArray = [];
    jobs.map((job) => {
      console.log(studentField, "student field");
      console.log(job.domain, "domain");
      if (job.domain === studentField) {
        score = 1;
      } else {
        score = 0;
      }
      score = score * 35;
      if (score > 0) return fieldArray.push({ id: job.id, score: score });
    });
    console.log("JOB DOMAINS", fieldArray);
    return fieldArray;
  };

  jobName = async (user, jobs) => {
    const student = await Student.findById(user.student);
    const studentPosition = student.positionSought.position.toUpperCase();

    let score = 0;
    let jobNameArray = [];

    jobs.map((job) => {
      const jobTitle = job.title.toUpperCase();
      const result = studentPosition.localeCompare(jobTitle);
      if (result === 0) {
        score = 1;
      } else {
        score = 0;
      }
      score = score * 4;
      if (score > 1) return jobNameArray.push({ id: job.id, score: score });
    });
    console.log("Jon Name ", jobNameArray);
    return jobNameArray;
  };
  //   // Starting Date //
  startDate = async (user, jobs) => {
    const student = await Student.findById(user.student);
    const studentStartingDate = moment(
      student.positionSought.startDate,
      "YYYY-MM-DD"
    );
    var startDateArray = [];
    let score = 0;
    jobs.map((job) => {
      const jobDate = moment(job.startDate, "YYYY-MM-DD");
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
      if (score > 1) return startDateArray.push({ id: job.id, score: score });
    });
    // res.status(200).json({ Jobs: filteredJobs });
    console.log("StartDate Jobs", startDateArray);
    return startDateArray;
  };

  lengthOfTheAlternate = async (user, jobs) => {
    const student = await Student.findById(user.student);
    console.log("Student", student);
    const studentDuration = student.positionSought.duration.split(" ");
    console.log(studentDuration, "Std Duration");
    var lengthOfTheAlternateArray = [];
    let score = 0;
    jobs.map((job) => {
      if (job.duration != undefined) {
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
        if (score > 1)
          return lengthOfTheAlternateArray.push({ id: job.id, score: score });
      }
    });
    console.log(lengthOfTheAlternateArray, "length of alternate array");
    return lengthOfTheAlternateArray;
  };

  levelOfEducation = async (user, jobs) => {
    const student = await Student.findById(user.student);
    console.log(student.positionSought.levelOfEducation, "LVL OF EDU");
    const studentEducation = student.positionSought.levelOfEducation;
    var levelOfEducationArray = [];
    let score = 0;
    jobs.map((job) => {
      if (job.levelOfEducation != undefined) {
        const jobLevelOfEducation = job.levelOfEducation;
        const result = studentEducation.localeCompare(jobLevelOfEducation);
        if (result === 0) {
          score = 1;
        } else {
          score = 0;
        }
        score = score * 4;
        if (score > 0)
          return levelOfEducationArray.push({ id: job.id, score: score });
      }
    });
    console.log("Level of edu", levelOfEducationArray);
    return levelOfEducationArray;
  };

  frequencyOfApprenticeship = async (user, jobs) => {
    const student = await Student.findById(user.student);
    const studentAlternationRhythm = student.positionSought.alternationRhythm;
    var frequencyOfApprenticeshipArray = [];
    let score = 0;

    jobs.map((job) => {
      if (job.alternationRhythm != undefined) {
        const jobAlternationRhythm = job.alternationRhythm;
        const result =
          studentAlternationRhythm.localeCompare(jobAlternationRhythm);

        if (result == 0) {
          score = 1;
        } else {
          score = 0;
        }
        score = score * 3;
        if (score > 0)
          return frequencyOfApprenticeshipArray.push({
            id: job.id,
            score: score,
          });
      }
    });
    console.log("Frequency", frequencyOfApprenticeshipArray);
    return frequencyOfApprenticeshipArray;
  };

  ageRange = async (user, jobs) => {
    const student = await Student.findById(user.student);
    const studentDOB = moment(student.positionSought.dateOfBirth, "YYYY-MM-DD");

    const currentDate = moment(new Date());
    const studentAge = Math.abs(studentDOB.diff(currentDate, "years"));
    var ageRangeArray = [];
    let score = 0;
    jobs.map((job) => {
      if (job.ageRange != undefined) {
        const jobAgeRange = job.ageRange;
        const splittedjobAgeRange = job.ageRange.split("-");
        if (jobAgeRange == "18-20" || jobAgeRange == "21-24") {
          if (
            studentAge >= splittedjobAgeRange[0] &&
            studentAge <= splittedjobAgeRange[1]
          ) {
            score = 1;
          } else {
            score = 0;
          }
        } else if (jobAgeRange == "25+") {
          if (studentAge >= 25) {
            score = 1;
          } else {
            score = 0;
          }
        }
        score = score * 4;
        if (score > 0)
          return ageRangeArray.push({
            id: job.id,
            score: score,
          });
      }
    });
    console.log("age", ageRangeArray);
    return ageRangeArray;
  };

  search = async (req, res, next) => {
    try {
      const user = req.user;
      const jobs = await this.startingDate(req.user, next);
      // Filters //
      const locationResult = await this.location(user, jobs);
      const softSkillsResult = await this.softSkills(user, jobs);
      const hardSkillsResult = await this.hardSkills(user, jobs);
      const fieldResult = await this.field(user, jobs);
      const jobNameResult = await this.jobName(user, jobs);
      const startDateResult = await this.startDate(user, jobs);
      const lengthOfTheAlternateResult = await this.lengthOfTheAlternate(
        user,
        jobs
      );
      const levelOfEducationResult = await this.levelOfEducation(user, jobs);
      const frequencyOfApprenticeshipResult =
        await this.frequencyOfApprenticeship(user, jobs);
      const ageRangeResult = await this.ageRange(user, jobs);

      // console.log(locationResult, "location");
      // console.log(softSkillsResult, "softSkillsResult");
      // console.log(hardSkillsResult, "hardSkillsResult");
      // console.log(fieldResult, "fieldResult");
      // console.log(jobNameResult, "jobNameResult");
      // console.log(startDateResult, "startDateResult");
      // console.log(lengthOfTheAlternateResult, "lengthOfTheAlternateResult");
      // console.log(levelOfEducationResult, "levelOfEducationResult");
      // console.log(
      //   frequencyOfApprenticeshipResult,
      //   "frequencyOfApprenticeshipResult"
      // );
      // console.log(ageRangeResult, "ageRangeResult");

      const newArray = [];

      jobs.map((job) => {
        let totalScore = 0;
        // Location Filter //
        let locationIndex = locationResult.findIndex(
          (loc) => loc.id === job.id
        );
        if (locationIndex != -1) {
          totalScore += locationResult[locationIndex].score / 100;
          console.log("totalScore location", totalScore);
        }
        //Soft Skills Filter //
        let softSkillIndex = softSkillsResult.findIndex(
          (softSkill) => softSkill.id === job.id
        );
        if (softSkillIndex != -1) {
          totalScore += softSkillsResult[softSkillIndex].score / 100;
        }
        // Hard Skills Filter //

        let hardSkillIndex = hardSkillsResult.findIndex(
          (hardSkill) => hardSkill.id === job.id
        );
        if (hardSkillIndex != -1) {
          totalScore += hardSkillsResult[hardSkillIndex].score / 100;
        }
        // // Field Filter //
        let fieldIndex = fieldResult.findIndex((field) => field.id === job.id);
        if (fieldIndex != -1) {
          totalScore += fieldResult[fieldIndex].score / 100;
        }

        // // Job Name Filter //
        let jobNameIndex = jobNameResult.findIndex(
          (jobName) => jobName.id === job.id
        );
        if (jobNameIndex != -1) {
          totalScore += jobNameResult[jobNameIndex].score / 100;
        }

        // // Start Date Filter //
        let startDateIndex = startDateResult.findIndex(
          (startDate) => startDate.id === job.id
        );
        if (startDateIndex != -1) {
          totalScore += startDateResult[startDateIndex].score / 100;
        }

        // // Length of the Alternate Filter //
        let lengthOfTheAlternateIndex = lengthOfTheAlternateResult.findIndex(
          (lengthOfTheAlternate) => lengthOfTheAlternate.id === job.id
        );
        if (lengthOfTheAlternateIndex != -1) {
          totalScore +=
            lengthOfTheAlternateResult[lengthOfTheAlternateIndex].score / 100;
        }

        // // Level Of Education Filter //
        let levelOfEducationIndex = levelOfEducationResult.findIndex(
          (levelOfEducation) => levelOfEducation.id === job.id
        );
        if (levelOfEducationIndex != -1) {
          totalScore +=
            levelOfEducationResult[levelOfEducationIndex].score / 100;
        }
        // // Frequency of Apprenticeship Filter //
        let frequencyOfApprenticeshipIndex =
          frequencyOfApprenticeshipResult.findIndex(
            (frequencyOfApprenticeship) =>
              frequencyOfApprenticeship.id === job.id
          );
        if (frequencyOfApprenticeshipIndex != -1) {
          totalScore +=
            frequencyOfApprenticeshipResult[frequencyOfApprenticeshipIndex]
              .score / 100;
        }
        // // Age Range Filter //
        let ageRangeIndex = ageRangeResult.findIndex(
          (ageRange) => ageRange.id === job.id
        );
        if (ageRangeIndex != -1) {
          totalScore += ageRangeResult[ageRangeIndex].score / 100;
        }
        newArray.push({
          jobId: job.id,
          score: totalScore,
        });
        newArray.sort(function (a, b) {
          return b.score - a.score;
        });
      });
      return newArray;
    } catch (err) {
      return res.status(200).json({ message: err.message });
    }
  };

  display = async (req, res, next) => {
    try {
      let output = [];
      const sortedArray = await this.search(req, res, next);
      if (sortedArray !== undefined) {
        console.log(sortedArray, "Arr");
        await Promise.all(
          sortedArray.map(async (job) => {
            const newJob = await Job.findByIdAndUpdate(job.jobId, {
              score: job.score,
            }).populate("company");
            output.push(newJob);
          })
        );
      }
      console.log(output, "Jobs on frontEnd");
      return res.status(200).json({ jobs: output });
    } catch (err) {
      console.log("err", err.message);
      //return res.status(200).json({ message: err.message });
    }
  };
}

module.exports = {
  MatchingCriteria,
  DealBreaker,
};
