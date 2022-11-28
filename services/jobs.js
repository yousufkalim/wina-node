const moment = require('moment');
const User = require('../models/User');
const Job = require('../models/Job');
const Student = require('../models/Student');

exports.searchJob = async (req, res, next) => {
  try {
    const jobs = await Job.find({ isDeleted: false });
    const student = await Student.findById(req.user.student);
    if (!jobs || !student) {
      return res.status(404).json({ message: 'student not found' });
    }
    const filteredJobs = await startDate(jobs, student);
    if (filteredJobs.length < 1) {
      return { data: filteredJobs };
    }
    const locationData = await location(filteredJobs, student, req.user);
    const softSkillData = await softSkill(locationData, student);
    const hardSkillData = await hardSkill(softSkillData, student);
    const fieldData = await field(hardSkillData, student);
    const startDateData = await startDateJob(fieldData, student);
    const lengthOfTheAlternateData = await lengthOfTheAlternate(startDateData, student);
    const levelOfEducationData = await levelOfEducation(lengthOfTheAlternateData, student);
    const frequencyOfApprenticeshipData = await frequencyOfApprenticeship(
      levelOfEducationData,
      student
    );
    const ageRangeData = await ageRange(frequencyOfApprenticeshipData, student);
    const data = await Display(ageRangeData);
    return data;
  } catch (err) {
    console.log('err-------->', err);
  }
};

const startDate = async (jobs, student) => {
  try {
    const filteredJobs = [];
    if (!student.positionSought.startDate) {
      return filteredJobs;
    }
    const studentStartingDate = moment(student.positionSought.startDate, 'YYYY-MM-DD');
    jobs.forEach(async job => {
      const jobDate = moment(job.startDate, 'YYYY-MM-DD');
      if (new Date(job.startDate) > new Date(student.positionSought.startDate)) {
        const result = Math.abs(jobDate.diff(studentStartingDate, 'months'));
        if (result <= 4) {
          filteredJobs.push(job);
        }
      }
    });
    return filteredJobs;
  } catch (err) {
    console.log('err', err.message);
    return res.status(500).json({ message: err.message });
  }
};

const location = async (jobs, student, user) => {
  try {
    const locationFilterArray = [];
    if (!user.address.latitude || !user.address.longitude) {
      jobs.map(job => {
        return locationFilterArray.push({ job: job, score: 0 });
      });
    }

    jobs.map(job => {
      if (
        job.location.latitude &&
        job.location.longitude &&
        user.address.latitude &&
        user.address.longitude
      ) {
        const latitude2 = job.location.latitude;
        const longitude2 = job.location.longitude;
        const latitude1 = user.address.latitude;
        const longitude1 = user.address.longitude;
        const score = calcDistance(latitude1, longitude1, latitude2, longitude2);
        if (!isNaN(score)) {
          locationFilterArray.push({ job: job, score: 5 });
        } else {
          locationFilterArray.push({ job: job, score: 0 });
        }
      } else if (
        !user.address.latitude ||
        !user.address.longitude ||
        !job.location.latitude ||
        !job.location.longitude
      ) {
        return locationFilterArray.push({ job: job, score: 0 });
      }
    });
    return locationFilterArray;
  } catch (err) {
    console.log('err', err.message);
  }
};

const softSkill = async (jobs, student) => {
  try {
    const userSoftSkills = student.softSkills;
    const softSkillsArray = [];
    if (userSoftSkills.length < 1) {
      jobs.map(async job => {
        softSkillsArray.push({ job: job.job, score: job.score + 0.5 });
      });
      return softSkillsArray;
    }
    var n = 0;
    var score = 0;
    jobs.map(job => {
      n = 0;
      userSoftSkills.map(async item => {
        job.job.softSkills.map(async item1 => {
          if (item.toString() === item1.toString()) {
            n++;
          }
        });
      });
      if (n == 0) {
        score = 0.5;
      } else {
        score = 1;
      }
      softSkillsArray.push({ job: job.job, score: job.score + score });
    });
    return softSkillsArray;
  } catch (err) {
    console.log('err', err.message);
  }
};

const hardSkill = async (jobs, student) => {
  try {
    const userHardSkills = student.hardSkills;
    const hardSkillsArray = [];
    if (userHardSkills.length < 1) {
      jobs.map(job => {
        hardSkillsArray.push({ id: job.job, score: job.score + 0.5 });
      });
      return hardSkillsArray;
    }
    var score = 0;
    jobs.map(job => {
      let n = 0;
      userHardSkills.map(item => {
        if (job?.job?.hardSkills?.length > 0) {
          job?.job?.hardSkills?.map(item1 => {
            if (item.toString() === item1.toString()) {
              n++;
            }
          });
        } else {
          n = 0;
        }
      });
      if (n == 0) {
        score = 0.5;
      } else {
        score = 1;
      }
      hardSkillsArray.push({ job: job.job, score: job.score + score });
    });
    return hardSkillsArray;
  } catch (err) {
    console.log('err', err.message);
  }
};
const field = async (jobs, student) => {
  const studentField = student.positionSought.domain;
  let score = 0;
  let fieldArray = [];
  if (!student.positionSought.domain) {
    jobs.map(job => {
      return fieldArray.push({ job: job.job, score: job.score + 0 });
    });
  }
  jobs.map(job => {
    if (job.job.domain) {
      if (job.job.domain === studentField) {
        score = 1;
      } else {
        score = 0;
      }
      return fieldArray.push({ job: job.job, score: job.score + score });
    } else {
      return fieldArray.push({ job: job.job, score: job.score + 0 });
    }
  });
  return fieldArray;
};
const startDateJob = async (jobs, student) => {
  const studentStartingDate = moment(student.positionSought.startDate, 'YYYY-MM-DD');
  var startDateArray = [];
  if (!student.positionSought.startDate) {
    jobs.map(job => {
      return startDateArray.push({ job: job.job, score: job.score + 0 });
    });
  }
  let score = 0;
  jobs.map(job => {
    if (!job.job.startDate) {
      return startDateArray.push({ job: job.job, score: job.score + 0 });
    }
    const jobDate = moment(job.job.startDate, 'YYYY-MM-DD');

    const result = Math.abs(studentStartingDate.diff(jobDate, 'weeks'));
    if (result <= 1) {
      score = 1;
    } else {
      score = 0;
    }
    return startDateArray.push({ job: job.job, score: job.score + score });
  });
  return startDateArray;
};
const lengthOfTheAlternate = async (jobs, student) => {
  var lengthOfTheAlternateArray = [];
  if (!student.positionSought.duration) {
    jobs.map(job => {
      return startDateArray.push({ job: job.job, score: job.score + 0 });
    });
  }
  const studentDuration = student.positionSought.duration.split(' ');
  let score = 0;

  jobs.map(job => {
    const jobDuration = job?.job?.duration ? job.job.duration.split(' ') : 0;
    const result = studentDuration[0] - jobDuration[0];

    if (result == 0) {
      score = 1;
    } else if (result == 1) {
      score = 0.4;
    } else if (result > 1) {
      score = 0;
    }

    return lengthOfTheAlternateArray.push({ job: job.job, score: job.score + score });
  });
  return lengthOfTheAlternateArray;
};
const levelOfEducation = async (jobs, student) => {
  if (!student.positionSought.levelOfEducation) {
    jobs.map(job => {
      const score = 0;
      return levelOfEducationArray.push({ job: job.job, score: job.score + score });
    });
  }
  const studentEducation = student.positionSought.levelOfEducation.toUpperCase();
  var levelOfEducationArray = [];
  let score = 0;
  jobs.map(job => {
    const jobLevelOfEducation = job.levelOfEducation ? job.levelOfEducation.toUpperCase() : '';
    const result = studentEducation.localeCompare(jobLevelOfEducation);
    if (result === 0) {
      score = 1;
    } else {
      score = 0;
    }
    return levelOfEducationArray.push({ job: job.job, score: job.score + score });
  });
  return levelOfEducationArray;
};
const frequencyOfApprenticeship = async (jobs, student) => {
  var frequencyOfApprenticeshipArray = [];
  if (!student.positionSought.alternationRhythm) {
    jobs.map(job => {
      return frequencyOfApprenticeshipArray.push({ job: job.job, score: job.score + 0 });
    });
  }
  const studentAlternationRhythm = student.positionSought.alternationRhythm;

  let score = 0;

  jobs.map(job => {
    const jobAlternationRhythm = job?.alternationRhythm ? job?.alternationRhythm.toUpperCase() : '';
    const result = studentAlternationRhythm.localeCompare(jobAlternationRhythm);
    if (result == 0) {
      score = 1;
    } else {
      score = 0;
    }
    return frequencyOfApprenticeshipArray.push({
      job: job.job,
      score: job.score + score
    });
  });
  return frequencyOfApprenticeshipArray;
};

const ageRange = async (jobs, student) => {
  var ageRangeArray = [];
  if (!student.positionSought.dateOfBirth) {
    jobs.map(job => {
      const score = 0;
      return ageRangeArray.push({ job: job.job, score: job.score + score });
    });
  }
  const studentDOB = moment(student.positionSought.dateOfBirth, 'YYYY-MM-DD');

  const currentDate = moment(new Date());
  const studentAge = Math.abs(studentDOB.diff(currentDate, 'years'));

  let score = 0;
  jobs.map(job => {
    if (!job.ageRange) {
      return ageRangeArray.push({
        job: job.job,
        score: job.score + 0
      });
    }
    const jobAgeRange = job.ageRange;
    const splittedjobAgeRange = job.ageRange.split('-');
    if (jobAgeRange == '18-20' || jobAgeRange == '21-24') {
      if (studentAge >= splittedjobAgeRange[0] && studentAge <= splittedjobAgeRange[1]) {
        score = 1;
      } else {
        score = 0;
      }
    } else if (jobAgeRange == '25+') {
      if (studentAge >= 25) {
        score = 1;
      } else {
        score = 0;
      }
    }
    return ageRangeArray.push({
      job: job.job,
      score: job.score + score
    });
  });
  return ageRangeArray;
};
const Display = async jobs => {
  try {
    let output = [];
    if (jobs) {
      await Promise.all(
        jobs.map(async job => {
          const score = (job.score / 13) * 100;
          const newJob = await Job.findByIdAndUpdate(
            job.job.id,
            {
              score: Math.floor(score)
            },
            { new: true }
          ).populate('company');
          output.push(newJob);
        })
      );
    }
    return output;
  } catch (err) {
    console.log('err', err.message);
  }
};
function calcDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}
function toRad(Value) {
  return (Value * Math.PI) / 180;
}
