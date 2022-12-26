const { expect, test } = require('@jest/globals');
const { matchStudents } = require('./matchStudents');
const mongoose = require('mongoose');
const Job = require('../../models/Job');
const Student = require('../../models/Student');
const DB_URL =
  'mongodb://REDACTED:REDACTED@dev.mhkzr1l.mongodb.net/Wina?retryWrites=true&w=majority';
require('../../models/User');

test('Test deal-breaker by adding 4 months diff between job and students', async () => {
  const job = {
    location: {
      latitude: 31.442907,
      longitude: 74.271519
    },
    ageRange: '18-20',
    softSkills: [
      '634d2fc56ad9a3aa3c064e2c',
      '634d2fc56ad9a3aa3c064e2e',
      '634d2fc56ad9a3aa3c064e2d',
      '634d2fc56ad9a3aa3c064e2c',
      '634d2fc56ad9a3aa3c064e69'
    ],
    hardSkills: [
      {
        _id: '634d2b86b9721da8fee2b121'
      },
      '634d2b86b9721da8fee2b122',
      '634d2b86b9721da8fee2b123',
      '634d2b86b9721da8fee2b13d',
      '634d2b86b9721da8fee2b147'
    ],
    domain: 'Achat / Comptabilité / Gestion',
    position: 'lawa developer',
    startDate: '2023-01-01T09:44:26.000Z',
    duration: '1 an',
    alternationRhythm: '1 jour école/ 4 jours entreprise',
    levelOfEducation: 'Brevet'
  };
  const students = [
    {
      positionSought: {
        levelOfEducation: 'Brevet',
        domain: 'Achat / Comptabilité / Gestion',
        alternationRhythm: '1 jour école/ 4 jours entreprise',
        dateOfBirth: '2002-12-31T19:00:00.000Z',
        startDate: '2021-08-28T19:00:00.000Z',
        duration: '1 an',
        position: 'lawa'
      },
      softSkills: [
        '634d2fc56ad9a3aa3c064e2c',
        {
          _id: '634d2fc56ad9a3aa3c064e2e'
        },
        '634d2fc56ad9a3aa3c064e2d'
      ],
      hardSkills: [
        '634d2b86b9721da8fee2b121',
        '634d2b86b9721da8fee2b122',
        '634d2b86b9721da8fee2b123'
      ],
      user: {
        address: {
          latitude: 31.446620698317826,
          longitude: 74.2704643576623
        }
      }
    }
  ];

  const { matchedStudents } = await matchStudents(job, students);
  expect(matchedStudents.length).toBe(0);
});

test('Test 0 score by matching all the criteria', async () => {
  const job = {
    location: {
      latitude: 48.910009,
      longitude: 2.280121
    },
    ageRange: '18-20',
    softSkills: [
      '634d2fc56ad9a3aa3c064e2c',
      '634d2fc56ad9a3aa3c064e2e',
      '634d2fc56ad9a3aa3c064e2d',
      '634d2fc56ad9a3aa3c064e2c',
      '634d2fc56ad9a3aa3c064e69'
    ],
    hardSkills: [
      '634d2b86b9721da8fee2b121',
      '634d2b86b9721da8fee2b122',
      '634d2b86b9721da8fee2b123',
      '634d2b86b9721da8fee2b13d',
      '634d2b86b9721da8fee2b147'
    ],
    domain: 'Achat / Comptabilité / Gestion',
    position: 'lawa developer',
    startDate: '2023-01-05T09:44:26.000Z',
    duration: '1 an',
    alternationRhythm: '1 jour école/ 4 jours entreprise',
    levelOfEducation: 'Brevet'
  };
  const students = [
    {
      positionSought: {
        levelOfEducation: 'BSCS',
        domain: 'Arts / Artisanat d’art / IT',
        alternationRhythm: '2 Jurs ecole / 3 jours enterprise/ 4 jours entreprise',
        dateOfBirth: '1990-12-31T19:00:00.000Z',
        startDate: '2022-10-21T19:00:00.000Z',
        duration: '6 ans',
        position: 'TL'
      },
      softSkills: ['634d2fc56aa3aa3c064e69ce'],
      hardSkills: [
        '634d2b86b972a8fee2b127de',
        '634d2b86b91da8fee2b13df3',
        '634d2b86b91da8fee2b147c5'
      ],
      user: {
        address: {
          latitude: 46.758777,
          longitude: -0.418837
        }
      }
    }
  ];

  const { matchedStudents } = await matchStudents(job, students);
  expect(matchedStudents[0].score).toBe(0);
});

test('Test 44.5 score by matching all the criteria', async () => {
  const job = {
    location: {
      latitude: 48.910009,
      longitude: 2.280121
    },
    ageRange: '18-20',
    softSkills: [
      '634d2fc56ad9a3aa3c064e2c',
      '634d2fc56ad9a3aa3c064e2e',
      '634d2fc56ad9a3aa3c064e2d',
      '634d2fc56ad9a3aa3c064e2c',
      '634d2fc56ad9a3aa3c064e69'
    ],
    hardSkills: [
      '634d2b86b9721da8fee2b121',
      '634d2b86b9721da8fee2b122',
      '634d2b86b9721da8fee2b123',
      '634d2b86b9721da8fee2b13d',
      '634d2b86b9721da8fee2b147'
    ],
    domain: 'Achat / Comptabilité / Gestion',
    position: 'lawa developer',
    startDate: '2023-01-05T09:44:26.000Z',
    duration: '1 an',
    alternationRhythm: '1 jour école/ 4 jours entreprise',
    levelOfEducation: 'Brevet'
  };
  const students = [
    {
      positionSought: {
        levelOfEducation: 'Brevet',
        domain: 'Arts / Artisanat d’art',
        alternationRhythm: '2 Jurs ecole/ 3 jours enterprise',
        dateOfBirth: '2002-12-31T19:00:00.000Z',
        startDate: '2022-12-21T19:00:00.000Z',
        duration: '1 ans',
        position: 'lawa'
      },
      softSkills: ['634d2fc56ad9a3aa3c064e69'],
      hardSkills: [
        '634d2b86b9721da8fee2b127',
        '634d2b86b9721da8fee2b13d',
        '634d2b86b9721da8fee2b147'
      ],
      user: {
        address: {
          latitude: 44.758777,
          longitude: -0.418837
        }
      }
    }
  ];

  const { matchedStudents } = await matchStudents(job, students);
  expect(matchedStudents[0].score).toBe(44.5);
});

test('Test 100% score by matching all the criteria', async () => {
  const job = {
    location: {
      latitude: 31.442907,
      longitude: 74.271519
    },
    ageRange: '18-20',
    softSkills: [
      '634d2fc56ad9a3aa3c064e2c',
      '634d2fc56ad9a3aa3c064e2e',
      '634d2fc56ad9a3aa3c064e2d',
      '634d2fc56ad9a3aa3c064e2c',
      '634d2fc56ad9a3aa3c064e69'
    ],
    hardSkills: [
      {
        _id: '634d2b86b9721da8fee2b121'
      },
      '634d2b86b9721da8fee2b122',
      '634d2b86b9721da8fee2b123',
      '634d2b86b9721da8fee2b13d',
      '634d2b86b9721da8fee2b147'
    ],
    domain: 'Achat / Comptabilité / Gestion',
    position: 'lawa developer',
    startDate: '2023-01-01T09:44:26.000Z',
    duration: '1 an',
    alternationRhythm: '1 jour école/ 4 jours entreprise',
    levelOfEducation: 'Brevet'
  };
  const students = [
    {
      positionSought: {
        levelOfEducation: 'Brevet',
        domain: 'Achat / Comptabilité / Gestion',
        alternationRhythm: '1 jour école/ 4 jours entreprise',
        dateOfBirth: '2002-12-31T19:00:00.000Z',
        startDate: '2022-12-28T19:00:00.000Z',
        duration: '1 an',
        position: 'lawa'
      },
      softSkills: [
        '634d2fc56ad9a3aa3c064e2c',
        {
          _id: '634d2fc56ad9a3aa3c064e2e'
        },
        '634d2fc56ad9a3aa3c064e2d'
      ],
      hardSkills: [
        '634d2b86b9721da8fee2b121',
        '634d2b86b9721da8fee2b122',
        '634d2b86b9721da8fee2b123'
      ],
      user: {
        address: {
          latitude: 31.446620698317826,
          longitude: 74.2704643576623
        }
      }
    }
  ];

  const { matchedStudents } = await matchStudents(job, students);
  expect(matchedStudents[0].score).toBe(100);
});

test('Test score calculation by getting data from DB', async () => {
  //   DB connection
  await mongoose.connect(DB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  });

  // Get all jobs and students
  const jobs = await Job.find().sort({ createdAt: -1 }).limit(10);
  const students = await Student.find({ isDeleted: false })
    .populate('user')
    .sort({ createdAt: -1 })
    .limit(100);
  await mongoose.connection.close(); // Close DB connection to avoid memory leak

  // Match students with jobs
  const promises = jobs.map(job => matchStudents(job, students));
  const newJobs = await Promise.all(promises);

  // Validating if every matched student has a score
  const result = newJobs.every(job => {
    return job.matchedStudents?.every(student => student.score !== undefined);
  });

  // Test
  expect(result).toBe(true);
});
