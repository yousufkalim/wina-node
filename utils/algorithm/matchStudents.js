/**
 * Winaa - Student Matching Algorithm - v1.0.0
 * @author Yousuf Kalim
 */

/**
 **************** Cigarette Lga aao *****************
 */

/**
 * Instructions for new maintainer:
 * 1. Make sure to document the every new line of code with comments
 * 2. Make sure to pass the eslint and unit tests
 * 3. Make sure to update the version number at the top of this file
 * 4. Make sure to update the CHANGELOGS.md file with the changes
 * 5. The score should be rounded to 1 decimal place
 * 6. Are you ready to f**k your mind? Read the workflow below before you start
 */

/**
 * Workflow:
 * 1. Create a new class called MatchCriteria
 * 2. Create a method for each criteria
 * 3. Each method should return a score between 0 and 1
 * 4. The score should be calculated based on the criteria
 * 5. The score should be rounded to 1 decimal place
 * 7. The score should be added to the student object
 * 9. The matchedStudents array should be added to the job object
 * 10. The job object should be returned
 */

const moment = require('moment');

/**
 * All the criteria are structured as sequence in this class
 */
class MatchCriteria {
  /**
   * Filter to get only the student with 4 or fewer months to start
   * @param job
   * @param students
   * @returns {*}
   */
  filterStudents(job, students) {
    return students.filter(student => {
      let diff = -1;

      try {
        let studentStartDate = student.positionSought?.startDate;
        let jobStartDate = job.startDate;

        // Validation
        if (!isNaN(Date.parse(jobStartDate)) && !isNaN(Date.parse(studentStartDate))) {
          // This means that if the difference between the starting date indicated by the student, and the starting date indicated for the offer is more than 4 months, the offer is automatically eliminated
          studentStartDate = moment(new Date(studentStartDate));
          jobStartDate = moment(new Date(jobStartDate));
          diff = jobStartDate.diff(studentStartDate, 'months');
        }
        return diff >= 0 && diff <= 4;
      } catch (err) {
        console.log('Error in filterStudents', err);
        return false;
      }
    });
  }

  /**
   * Calculation of score by the distance
   * @param job
   * @param student
   * @returns {number|number}
   */
  location(job, student) {
    let score = 0;

    try {
      const { latitude: lat1, longitude: lon1 } = job.location;
      const { latitude: lat2, longitude: lon2 } = student.user?.address;

      if (!lat1 || !lon1 || !lat2 || !lon2) {
        return score;
      }

      // Deg conversion
      const deg2rad = deg => {
        return deg * (Math.PI / 180);
      };

      // Distance calculation
      const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1); // deg2rad below
        const dLon = deg2rad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in km
      };

      // If distance is less than 0km then score will be 1
      // If distance is 10km then score will be 0.8
      // If distance is more than 50km then score will be 0
      // Note: 5 is coefficient
      score = (1 - getDistance(lat1, lon1, lat2, lon2) * 0.02) * 5;

      return score > 0 ? score : 0;
    } catch (err) {
      console.log('Error in location criteria: ', err);
      return 0;
    }
  }

  /**
   * Soft skill score calculation
   * @param job
   * @param student
   * @returns {number}
   */
  softSkills(job, student) {
    let score = 0;

    try {
      // Validation
      if (!Array.isArray(job.softSkills) || !Array.isArray(student.softSkills)) {
        return score;
      }

      // If data is populated then find the id, otherwise keep as it is
      let jobSkills = job.softSkills?.map(a => (typeof a === 'string' ? a : a._id));
      let studentSkills = student.softSkills?.map(a => (typeof a === 'string' ? a : a._id));

      // if student 3 skills matched with job skills then score will be 1
      // if student 2 skills matched with job skills then score will be 0.8
      // if student's 1 skill matched with job skills then score will be 0.5
      // Otherwise score will be 0
      const { length } = studentSkills.filter(skill => jobSkills.includes(skill));

      // Checking how many soft skills are matched
      if (length >= 3) {
        score = 1;
      } else if (length === 2) {
        score = 0.8;
      } else if (length === 1) {
        score = 0.5;
      }

      // Note: 15 is coefficient
      return score * 15;
    } catch (err) {
      console.log('Error in softSkills criteria: ', err);
      return 0;
    }
  }

  /**
   * Hard skill score calculation
   * @param job
   * @param student
   * @returns {number}
   */
  hardSkills(job, student) {
    let score = 0;

    try {
      // Validation
      if (!Array.isArray(job.hardSkills) || !Array.isArray(student.hardSkills)) {
        return score;
      }

      // If data is populated then find the id, otherwise keep as it is
      let jobSkills = job.hardSkills?.map(a => (typeof a === 'string' ? a : a._id));
      let studentSkills = student.hardSkills?.map(a => (typeof a === 'string' ? a : a._id));

      // if student 3 skills matched with job skills then score will be 1
      // if student 2 skills matched with job skills then score will be 0.8
      // if student's 1 skill matched with job skills then score will be 0.5
      // Otherwise score will be 0
      const { length } = studentSkills.filter(skill => jobSkills.includes(skill));

      // Checking how many soft skills are matched
      if (length >= 3) {
        score = 1;
      } else if (length === 2) {
        score = 0.8;
      } else if (length === 1) {
        score = 0.5;
      }

      // Note: 20 is coefficient
      return score * 20;
    } catch (err) {
      console.log('Error in hardSkills criteria: ', err);
      return 0;
    }
  }

  /**
   * Domain score calculation
   * @param job
   * @param student
   * @returns {number}
   */
  domain(job, student) {
    let score = 0;

    try {
      // if student's domain matched with job domain then score will be 1
      // Otherwise score will be 0
      if (job.domain === student.positionSought?.domain) {
        score = 1;
      }

      // Note: 35 is coefficient
      return score * 35;
    } catch (err) {
      console.log('Error in domain criteria: ', err);
      return 0;
    }
  }

  /**
   * Position score calculation
   * @param job
   * @param student
   * @returns {number}
   */
  position(job, student) {
    let score = 0;

    try {
      let jobPosition = job.position;
      let studentPosition = student.positionSought?.position;

      // Validation
      if (!jobPosition || !studentPosition) {
        return score;
      }

      // Making data easier to compare
      jobPosition = jobPosition.toLowerCase().replace(' ', '');
      studentPosition = studentPosition.toLowerCase().split(' ');

      // if student's position matched with job position then score will be 1
      // Otherwise score will be 0
      const { length } = studentPosition.filter(a => jobPosition.includes(a));

      if (length) {
        score = 1;
      }

      // Note: 4 is coefficient
      return score * 4;
    } catch (err) {
      console.log('Error in position criteria: ', err);
      return 0;
    }
  }

  /**
   * Start date score calculation
   * @param job
   * @param student
   * @returns {number}
   */
  startDate(job, student) {
    let score = 0;

    try {
      let jobStartDate = job.startDate;
      let studentStartDate = student.positionSought?.startDate;

      // Validation
      if (!jobStartDate || !studentStartDate) {
        return score;
      }

      // if student start date and job start date difference is less than 1 week then score will be 1
      // if student start date and job start date difference is between 1-2 weeks then score will be 0.8
      // if student start date and job start date difference is between 2-4 weeks then score will be 0.3
      // if student start date and job start date difference is more than 4 weeks then score will be 0
      jobStartDate = moment(jobStartDate);
      studentStartDate = moment(studentStartDate);
      const diff = jobStartDate.diff(studentStartDate, 'days');

      if (diff <= 7) {
        score = 1;
      } else if (diff > 7 && diff <= 14) {
        score = 0.8;
      } else if (diff > 14 && diff <= 28) {
        score = 0.3;
      }

      // Note: 5 is coefficient
      return score * 5;
    } catch (err) {
      console.log('Error in startDate criteria: ', err);
      return 0;
    }
  }

  /**
   * Job duration score calculation
   * @param job
   * @param student
   * @returns {number}
   */
  duration(job, student) {
    let score = 0;

    try {
      let jobDuration = job.duration;
      let studentDuration = student.positionSought?.duration;

      //   Validation
      if (!jobDuration || !studentDuration) {
        return score;
      }

      //   Parsing number from string
      jobDuration = parseFloat(jobDuration.split(' ')[0]);
      studentDuration = parseFloat(studentDuration.split(' ')[0]);

      // Validation of parsed numbers
      if (isNaN(jobDuration) || isNaN(studentDuration)) {
        return score;
      }

      // If job and student's job duration is same then the score will be 1
      // If there is 1 year diff in job and student's job duration then the score will be 0.4
      // Otherwise score will be 0
      if (jobDuration === studentDuration) {
        score = 1;
      } else if (Math.abs(jobDuration - studentDuration) === 1) {
        score = 0.4;
      }

      // Note: 5 is coefficient
      return score * 5;
    } catch (err) {
      console.log('Error in duration criteria: ', err);
      return 0;
    }
  }

  /**
   * Education level score calculation
   * @param job
   * @param student
   * @returns {number}
   */
  education(job, student) {
    // TODO: Education matching need to be updated as written in algorithm file
    let score = 0;

    try {
      const jobEduLevel = job?.levelOfEducation?.toUpperCase();
      const studentEduLevel = student.positionSought?.levelOfEducation?.toUpperCase();

      //   Validation
      if (!jobEduLevel || !studentEduLevel) {
        return score;
      }

      // if students education level matched with job education level then the score will be 1
      // Otherwise score will be 0

      // using localeCompare method, so we can compare even if there is an accent diff
      const result = jobEduLevel.localeCompare(studentEduLevel, 'en', { sensitivity: 'base' });
      if (result === 0) {
        score = 1;
      }

      //   Note: 4 is coefficient
      return score * 4;
    } catch (err) {
      console.log('Error in education criteria: ', err);
      return 0;
    }
  }

  /**
   * Frequency of apprenticeship score calculation
   * @param job
   * @param student
   * @returns {number}
   */
  frequencyOfApprenticeship(job, student) {
    let score = 0;

    try {
      const jobRhythm = job?.alternationRhythm;
      const studentRhythm = student.positionSought?.alternationRhythm;

      //   Validation
      if (!jobRhythm || !studentRhythm) {
        return score;
      }

      // if student's frequency of apprenticeship matched with job frequency of apprenticeship then the score will be 1
      // Otherwise score will be 0

      // using localeCompare method, so we can compare even if there is an accent diff
      const result = jobRhythm.localeCompare(studentRhythm, 'en', { sensitivity: 'base' });
      if (result === 0) {
        score = 1;
      }

      //   Note: 4 is coefficient
      return score * 3;
    } catch (err) {
      console.log('Error in frequencyOfApprenticeship criteria: ', err);
      return 0;
    }
  }

  /**
   * Age score calculation
   * @param job
   * @param student
   * @returns {number}
   */
  age(job, student) {
    //   checking if student age fall in the age rang of job
    let score = 0;

    try {
      const ageRange = job.ageRange;
      const age = student.positionSought?.dateOfBirth;

      //   Validation
      if (!ageRange || !age) {
        return score;
      }

      //   Calculating age from date of birth
      const ageDiff = moment().diff(moment(age), 'years');

      //  If student age is in the range of job then score will be 1
      //  Age range should be like this ['18-20', '21-24', '25+']
      // Otherwise score will be 0
      if (ageRange === '25+') {
        if (ageDiff >= 25) {
          score = 1;
        }
      } else {
        //   Parsing age from string
        const [minAge, maxAge] = ageRange.split('-').map(item => parseInt(item, 10));

        //   Validation of parsed numbers
        if (isNaN(minAge) || isNaN(maxAge)) {
          return score;
        }

        //   Checking if student age fall in the age rang of job
        if (ageDiff >= minAge && ageDiff <= maxAge) {
          score = 1;
        }
      }

      // Note: 3 is coefficient
      return score * 4;
    } catch (err) {
      console.log('Error in age criteria: ', err);
      return 0;
    }
  }
}

/**
 * This function will calculate the score of a students for a job
 * @param {Object} job - job object
 * @param {Array} students - array of students
 * @returns {Object}
 */
exports.matchStudents = (job, students, appendInJob = false) => {
  return new Promise((resolve, reject) => {
    try {
      // Validation
      if (typeof job !== 'object' || !Object.keys(job).length || !Array.isArray(students)) {
        return reject('Invalid arguments');
      }

      // Performing clone of the arguments to avoid mutation
      job = JSON.parse(JSON.stringify(job));
      students = JSON.parse(JSON.stringify(students));

      // Initialize MatchCriteria Class
      const matchCriteria = new MatchCriteria();

      // Filtering to get only the student with 4 or fewer months to start
      const filteredStudents = matchCriteria.filterStudents(job, students);

      const matchedStudents = [];

      //   Looping through the filtered students
      for (let i = 0; i < filteredStudents.length; i++) {
        //   Calculating score for each student
        let student = filteredStudents[i];

        try {
          // All the criteria runs here and the score is calculated
          const score = [
            matchCriteria.location(job, student),
            matchCriteria.softSkills(job, student),
            matchCriteria.hardSkills(job, student),
            matchCriteria.domain(job, student),
            matchCriteria.position(job, student),
            matchCriteria.startDate(job, student),
            matchCriteria.duration(job, student),
            matchCriteria.education(job, student),
            matchCriteria.frequencyOfApprenticeship(job, student),
            matchCriteria.age(job, student)
          ].reduce((acc, curr) => acc + curr, 0);
          student.score = parseFloat(score.toFixed(1));

          matchedStudents.push(student);
        } catch (err) {
          //  If any error occurs in the criteria then the student's score will be 0
          console.log('Error in calculating score for student: ', err);
          student.score = 0;
          matchedStudents.push(student);
        }
      }

      matchedStudents.sort((a, b) => b.score - a.score);

      if (appendInJob) {
        job.matchedStudents = matchedStudents;
        return resolve(job);
      }

      // Done dana done
      return resolve(matchedStudents);
    } catch (err) {
      console.log('Error in matching algorithm: ', err);
      return reject(err);
    }
  });
};
