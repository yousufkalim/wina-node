/**
 * Winaa - Student Matching Algorithm - v1.0.0
 * @author Yousuf Kalim
 */
const moment = require('moment');

let job = {
  location: {
    street: 'Allée Haag 92600 Asnières-sur-Seine',
    zip: '92600',
    city: 'Asnières-sur-Seine',
    latitude: 48.910009,
    longitude: 2.280121
  },
  photo: {
    status: 'Validated',
    image: 'views/uploads/1671702414096-0daadc.png'
  },
  status: 'open',
  score: 61,
  ageRange: '18-20',
  likedBy: [],
  InterestedStudents: [],
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
  isDeleted: false,
  _id: '63a4278eb225b4633fb2b4ce',
  description: 'lawa is a pawa developer',
  domain: 'Achat / Comptabilité / Gestion',
  position: 'lawa developer',
  startDate: '2023-01-05T09:44:26.000Z',
  duration: '1 an',
  alternationRhythm: '1 jour école/ 4 jours entreprise',
  levelOfEducation: 'Brevet',
  company: {
    address: {
      city: 'Lieusaint',
      street: 'Avenue Iqbal Masih 77127 Lieusaint',
      zip: '76520',
      longitude: 2.556463,
      latitude: 48.636971
    },
    professional_Picture: 'views/uploads/0daadc.png',
    presentation_Video: 'views/uploads/XRecorder_10102022_104944.mp4',
    contactPerson: {
      person: '635f6dcfb5c98d0a9dcc922c',
      positionHeld: 'Reactjs Dev'
    },
    job: [
      '635f714281480d0842e04064',
      '635f719181480d0842e04069',
      '635f774581480d0842e042ff',
      '635f98b7b5c98d0a9dcc96a1',
      '635fc68fb5c98d0a9dcca0b4',
      '6360f491a9179332c0c25072',
      '636a3280133f31119fd64a19',
      '636c991479b6c503756a80d5',
      '636ccd8a79b6c503756a92ec',
      '636ddf93e882c1043b527632',
      '63721bea4f3fb882aa603650',
      '63722dbb0dbab4133ec97eb2',
      '6373347aef518b88b397aeb6',
      '637334f8ef518b88b397af39',
      '6373361bef518b88b397af3e',
      '63733ca31bd6e203c64d73ec',
      '63733fbcc28a802da4872da6',
      '637341b31bd6e203c64d77e7',
      '6375c0de28258a028f8c9fb5',
      '6375ccf905c49707c0f86c60',
      '6375dfcdd22933ff73af872e',
      '6375e58a64bf840aa919e480',
      '6375e63064bf840aa919e4fc',
      '6375e96664bf840aa919e7d1',
      '6375e9c664bf840aa919e825',
      '637625f2d22933ff73af8e42',
      '637b713555757f06ffa7e581',
      '637b72da1a46907b86b18846',
      '637b73381a46907b86b18851',
      '637b73de1a46907b86b188ce',
      '637b75471a46907b86b18c61',
      '637b76311a46907b86b18d19',
      '637b77cb1a46907b86b18ed2',
      '637b786c1a46907b86b19053',
      '637b79581a46907b86b191ea',
      '637b7a8a1a46907b86b19664',
      '637c671ce90c4b247d411e91',
      '637c7140e9b293054a257d24',
      '637ca1d8570d194983818195',
      '637cbc157f85817e0a36982c',
      '63849fbea6b19a35a8ffca9d',
      '63885d0bc0c05e2140c26a9e',
      '638889b012c4c87e7fa5d6c5',
      '6398532421e0dd87ead20387',
      '6399b644a0bf0442a85bca57',
      '6399b757a0bf0442a85bcb9f',
      '639ab196796a16ae8b5756a0',
      '639ab4ce8a33141444d3640a',
      '639ab62c796a16ae8b57696e',
      '639aeb72796a16ae8b578438',
      '63a04698796a16ae8b57b58f',
      '63a194eb796a16ae8b57d16d',
      '63a2f4ea66b21f236d313b36',
      '63a2f53c66b21f236d313d54',
      '63a2f6c5762d988cd8adcdff',
      '63a4278eb225b4633fb2b4ce'
    ],
    isDeleted: false,
    _id: '635f6dd0b5c98d0a9dcc922e',
    name: 'Test company',
    company_type: 'Startup',
    siretNumber: '2',
    website: 'linkedin.com',
    groupName: '',
    linkedIn: 'linkedin',
    members: [
      {
        _id: '637f1c2ca7942c0f48857612',
        photo: 'views/uploads/265-2658314_clip-art-line-cartoon-text-font-invoice-bill.png',
        name: 'diegi costa',
        designation: 'desc'
      },
      {
        _id: '637f4616a7942c0f4885895b',
        photo: 'views/uploads/265-2658314_clip-art-line-cartoon-text-font-invoice-bill.png',
        name: 'desc',
        designation: 'desc'
      }
    ],
    stages: [
      {
        _id: '637c9e2a421a0445781f4354',
        photo: 'views/uploads/dummy-image.jpeg',
        title: 'diego costa'
      },
      {
        _id: '637f5286a7942c0f4885998a',
        photo: 'views/uploads/265-2658314_clip-art-line-cartoon-text-font-invoice-bill.png',
        title: 'diego'
      }
    ],
    createdAt: '2022-10-31T06:40:16.107Z',
    __v: 57,
    company_description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce lacinia erat augue. Donec vitae diam a metus rhoncus eleifend vitae at lectus',
    stages_description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    teams_description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
    notifications: [
      {
        read: false,
        _id: '637b0f69eaa9430313b09460',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T05:40:57.328Z'
      },
      {
        read: false,
        _id: '637b1445dc42d908167e10b8',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:01:41.717Z'
      },
      {
        read: false,
        _id: '637b178bdc42d908167e115b',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:15:39.710Z'
      },
      {
        read: false,
        _id: '637b19b7dc42d908167e116f',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:24:55.505Z'
      },
      {
        read: false,
        _id: '637b1b4ca4789509a39fea8a',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:31:40.663Z'
      },
      {
        read: false,
        _id: '637b1d1b288b4ee31c3d2d8d',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:39:23.625Z'
      },
      {
        read: false,
        _id: '637b1d53288b4ee31c3d2d99',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:40:19.427Z'
      },
      {
        read: false,
        _id: '637b1dcc4bd137e386115162',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:42:20.189Z'
      },
      {
        read: false,
        _id: '637b1e0699cb23e3b3d3b57b',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:43:18.911Z'
      },
      {
        read: false,
        _id: '637b1fddd4a158e4c463e31a',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:51:09.356Z'
      },
      {
        read: false,
        _id: '637b2138abe16ee54c5c1ea0',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:56:56.435Z'
      },
      {
        read: false,
        _id: '637b21824a902ae586cd0439',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:58:10.747Z'
      },
      {
        read: false,
        _id: '637b21b0bf4174e5a04a9f78',
        title: 'étudiant est appliqué sur votre emploi',
        description: 'Test   Student étudiant est appliqué sur votre emploi',
        createdAt: '2022-11-21T06:58:56.879Z'
      },
      {
        read: false,
        _id: '637b46228b310312de6afb93',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-21T09:34:26.166Z'
      },
      {
        read: false,
        _id: '637b46d58b310312de6afc3c',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-21T09:37:25.912Z'
      },
      {
        read: false,
        _id: '637b493e8b310312de6afe2c',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-21T09:47:42.741Z'
      },
      {
        read: false,
        _id: '637b49508b310312de6aff19',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-21T09:48:00.016Z'
      },
      {
        read: false,
        _id: '6384a117a6b19a35a8ffcbd6',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-28T11:52:55.140Z'
      },
      {
        read: false,
        _id: '6384a11da6b19a35a8ffcbe5',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-28T11:53:01.186Z'
      },
      {
        read: false,
        _id: '6384a123a6b19a35a8ffcbf1',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-28T11:53:07.515Z'
      },
      {
        read: false,
        _id: '6384a128a6b19a35a8ffcbfd',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-28T11:53:12.493Z'
      },
      {
        read: false,
        _id: '6385ce5b6c3780404a592e90',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:18:19.675Z'
      },
      {
        read: false,
        _id: '6385ce6f6c3780404a592f5b',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:18:39.579Z'
      },
      {
        read: false,
        _id: '6385cf026c3780404a593009',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:21:06.709Z'
      },
      {
        read: false,
        _id: '6385cf746c3780404a5930b7',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:23:00.426Z'
      },
      {
        read: false,
        _id: '6385d0606c3780404a5931b7',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:26:56.680Z'
      },
      {
        read: false,
        _id: '6385d1846c3780404a593309',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:31:48.797Z'
      },
      {
        read: false,
        _id: '6385d2fc6c3780404a5934ff',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:38:04.426Z'
      },
      {
        read: false,
        _id: '6385d3f76c3780404a593756',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:42:15.553Z'
      },
      {
        read: false,
        _id: '6385d60f6c3780404a593865',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:51:11.480Z'
      },
      {
        read: false,
        _id: '6385d64f6c3780404a593b94',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:52:15.241Z'
      },
      {
        read: false,
        _id: '6385d6646c3780404a593c42',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:52:36.178Z'
      },
      {
        read: false,
        _id: '6385d6f86c3780404a593e8a',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:55:04.386Z'
      },
      {
        read: false,
        _id: '6385d73b6c3780404a5940c3',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:56:11.355Z'
      },
      {
        read: false,
        _id: '6385d7b76c3780404a594206',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T09:58:15.795Z'
      },
      {
        read: false,
        _id: '6385d9a06c3780404a594510',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T10:06:24.241Z'
      },
      {
        read: false,
        _id: '6385da416c3780404a5946b4',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T10:09:05.740Z'
      },
      {
        read: false,
        _id: '6385db206c3780404a594962',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T10:12:48.125Z'
      },
      {
        read: false,
        _id: '6385dd206c3780404a594c91',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T10:21:20.434Z'
      },
      {
        read: false,
        _id: '6385e87ec812a24c302ab982',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T11:09:50.680Z'
      },
      {
        read: false,
        _id: '6385ea36c812a24c302aba30',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T11:17:10.842Z'
      },
      {
        read: false,
        _id: '6385ed6bc812a24c302abade',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T11:30:51.937Z'
      },
      {
        read: false,
        _id: '6385eee5c812a24c302abb8c',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-29T11:37:09.389Z'
      },
      {
        read: false,
        _id: '6386f6f0baea886024b7382a',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-30T06:23:44.887Z'
      },
      {
        read: false,
        _id: '6386f92e2930ef6124c9bed0',
        title: 'Test   Student a accepté votre offre',
        description: 'Test   Student a accepté votre offre',
        createdAt: '2022-11-30T06:33:18.853Z'
      }
    ]
  },
  student_requests: [],
  company_requests: [],
  createdAt: '2022-12-22T09:46:54.578Z',
  __v: 0
};

let students = [
  {
    presentation_Video: {
      status: 'To be Validated',
      video: 'XRecorder_10102022_104944.mp4'
    },
    professional_Picture: {
      status: 'To be Validated',
      image: '1671692702414-5769CFAB-A148-4AD8-BC94-B4B95135FD8C.jpg'
    },
    positionSought: {
      levelOfEducation: 'Brevet',
      domain: 'Arts / Artisanat d’art',
      alternationRhythm: '2 Jurs ecole/ 3 jours enterprise',
      dateOfBirth: '2002-12-31T19:00:00.000Z',
      startDate: '2022-12-21T19:00:00.000Z',
      duration: '1 ans',
      position: 'lawa',
      description: 'Sdfgh'
    },
    score: -0.3151107242178976,
    offer_status: 'proposal',
    softSkills: ['634d2fc56ad9a3aa3c064e69'],
    hardSkills: [
      '634d2b86b9721da8fee2b127',
      '634d2b86b9721da8fee2b13d',
      '634d2b86b9721da8fee2b147'
    ],
    isDeleted: false,
    _id: '635f6f4981480d0842e03fef',
    general_Presentation:
      'chargée avec Vidéo téléchargée avec Vidéo téléchargée avec Vidéo téléchargée avec Vidéo téléchargée avec Vidéo téléchargée a121212',
    user: {
      address: {
        street: '33, Gironde, Nouvelle-Aquitaine',
        city: 'Saint-Caprais-de-Bordeaux',
        zip: '33880',
        latitude: 44.758777,
        longitude: -0.418837
      },
      role: 'user',
      type: 'student',
      status: 'active',
      appointments: ['6361028b384bc7375f54405e'],
      isDeleted: false,
      isSignupByGoogle: false,
      isSignupByFacebook: false,
      isSignupByApple: false,
      invitation: [],
      _id: '635f6f4981480d0842e03fed',
      firstName: 'New',
      lastName: 'Student',
      email: 'student@gmail.com',
      phone: 987678909,
      createdAt: '2022-10-31T06:46:33.426Z',
      __v: 0,
      student: '635f6f4981480d0842e03fef',
      emailVerificationExpiresIn: '2022-10-31T16:46:34.267Z',
      verifyEmailToken: 'eb1287f724fef9b8145e5ae1016c82a9b07276c5'
    },
    education: [],
    professional_profile: [
      {
        duration: {
          start_date: '1988-07-15T19:00:00.000Z',
          end_date: '2022-12-20T12:52:42.553Z'
        },
        position_hold: true,
        _id: '63a3f0d6762d988cd8add2db',
        position: 'React JS',
        company: 'Cardenas Mejia Co',
        place: 'Non nulla lorem exer',
        type: 'CDI',
        description: 'tesitng',
        image: 'views/uploads/0daadc.png'
      },
      {
        duration: {
          start_date: '1988-07-04T19:00:00.000Z',
          end_date: '2022-12-13T09:39:10.590Z'
        },
        position_hold: true,
        _id: '63a3f0d6762d988cd8add2dc',
        position: 'React JS',
        company: 'Carde',
        place: 'qwert',
        type: 'Indépendant',
        description: 'qwerty',
        image: 'views/uploads/0daadc.png'
      },
      {
        duration: {
          start_date: '1988-07-01T19:00:00.000Z',
          end_date: '2022-12-14T11:03:15.472Z'
        },
        position_hold: true,
        _id: '63a3f0d6762d988cd8add2dd',
        position: 'React JS',
        company: 'Dorsey and Malone Plc',
        place: 'Non nulla lorem exer',
        type: 'CDI',
        description: 'qwerty',
        image: 'views/uploads/0daadc (1).png'
      }
    ],
    languages: [
      {
        _id: '63a401fa762d988cd8add82a',
        name: 'Fr'
      }
    ],
    createdAt: '2022-10-31T06:46:33.580Z'
  }
];

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
        if (jobStartDate && studentStartDate) {
          // This means that if the difference between the starting date indicated by the student, and the starting date indicated for the offer is more than 4 months, the offer is automatically eliminated
          studentStartDate = moment(studentStartDate);
          jobStartDate = moment(jobStartDate);
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
exports.matchStudents = (job, students) => {
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

      // Sorting students based on score
      job.matchedStudents = matchedStudents.sort((a, b) => b.score - a.score);

      // Done dana done
      return resolve(job);
    } catch (err) {
      console.log('Error in matching algorithm: ', err);
      return reject(err);
    }
  });
};
