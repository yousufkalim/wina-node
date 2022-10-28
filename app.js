const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv').config();
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

// var GoogleStrategy = require("passport-google-oauth2").Strategy;
const MongoStore = require('connect-mongo')(session);
const User = require('./models/User');
const Student = require('./models/Student');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const socketio = require('socket.io');
const http = require('http');
var cors = require('cors');
const logger = require('morgan');
const app = express();
const server = http.createServer(app);
var xlsx = require('xlsx');
const notificationService = require('./socket.io/notifications');
require('./utils/passport');
require('./utils/linkedInOauth');
app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: '*'
  })
);

//// Body Parser Middleware ////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  console.log('Reading the spreadsheet..');
  const workbook = xlsx.readFile('./public/skills.xlsx');
  const sheets = workbook.SheetNames;
  var xlData = workbook.Sheets[sheets[0]];
  let jsonData = xlsx.utils.sheet_to_json(xlData);

  console.log('Reading second sheet...', sheets);

  res.json({ message: 'success', jsonData });
});
// Morgan
app.use(logger('dev'));

//// Cookie Parser ////

app.use(cookieParser());

//// PUBLIC Folrders Configuartion ////

app.use('/assets', express.static('assets'));
app.use('/views', express.static('views'));

// socket io connection
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

//// Sessions Middleware ////

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

//// DataBase Connection ////

mongoose
  .connect(process.env.Database_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('Database has connected successfully');
  })
  .catch(err => {
    console.log(err);
  });

// Initializing Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//// Routes ////

const auth = require('./routes/auth');
const student = require('./routes/student');
const company = require('./routes/company');
const studentConsultant = require('./routes/studentConsultant');
const companyConsultant = require('./routes/companyConsultant');
const profile = require('./routes/profile');
const admin = require('./routes/admin');
const job = require('./routes/job');
const FileUpload = require('./routes/FileUpload');
const adminAuth = require('./routes/adminAuth');

//// Mount Routers ////

app.use('/api/v1/auth', auth);
app.use('/api/v1/student', student);
app.use('/api/v1/company', company);
app.use('/api/v1/student-consultant', studentConsultant);
app.use('/api/v1/company-consultant', companyConsultant);
app.use('/api/v1/profile', profile);
app.use('/api/v1/admin', admin);
app.use('/api/v1/job', job);
app.use('/api/v1', FileUpload);
app.use('/api/v1/adminAuth', adminAuth);

/// V2 Company route ///

// app.use('/api/v2/company', companyV2);

// app.use("/api/v1/admin", admin);

//// Error Handler
app.use((error, req, res, next) => {
  console.log('Main Error =>', error);
  const message = error.message;
  const status = error.status || 500;
  res.status(status).json({ message: message, error: error });
});
//// Setting Port for Server ////

//// Setting Port for Server ////
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});

// Socket configuration //
io.on('connection', socket => {
  console.log('User Connected');

  socket.on('sendnotification', data => {
    socket.broadcast.emit('sendnotification', data);
  });

  exports.socket = { socket, io };
  var useris = socket.handshake.query.userConnectionId;
  socket.join(useris);
  //Leave the room if the user closes the socket
  socket.on('disconnect', () => {
    socket.leave(useris);
  });

  // for dynamic notifications
  var recieverId = socket.handshake.query.recieverId;
  socket.on(`sendNotification`, data => {
    // logic to save notifications in our db
    notificationService
      .addNotifcation({
        id: data.id
        // title: data.title,
        // message: data.message,
      })
      .then(message => {
        console.log(message, 'message');
        socket.broadcast.emit(`recieveNotification${data.id}`, {
          // title: "qwerty",
          // message: "qwerty",
        });
      })
      .catch(e => console.log(e));
  });
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new FacebookStrategy(
    {
      clientID: '351494413149636',
      clientSecret: '6dc8c994fa5b86cf78acc0372d4177b6',
      callbackURL: 'http://localhost:9190/auth/facebook/callback'
    },
    async function (accessToken, refreshToken, profile, cb) {
      await User.findOne({ email: profile.email }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get('/api/v1/auth/facebook', passport.authenticate('facebook'));

app.get(
  '/api/v1/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.json({ success: true, user: req });
  }
);
app.get('/api/v1/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

app.get(
  '/api/v1/auth/google/callback',
  passport.authenticate('google', {
    successReturnToOrRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure'
  })
);

app.get('/auth/google/success', async (req, res) => {
  try {
    const profile = req.user;
    const email = req.user.emails[0].value;
    const user = await User.findOne({ email: email });
    if (user) {
      const token = user.getSignedJwtToken();

      if (user.status === 'googleSignup') {
        return res.redirect(process.env.REACT_URL + `?SignupByGoogle=true&&user=${token}`);
      } else {
        return res.redirect(process.env.REACT_URL + `goolgeLogin?token=${token}`);
      }
    } else {
      let newUser = await User.create({
        role: 'user',
        status: 'googleSignup',
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: email,
        isSignupByGoogle: true
      });
      const token = newUser.getSignedJwtToken();

      return res.redirect(process.env.REACT_URL + `?SignupByGoogle=true&&user=${token}`);
    }
  } catch (error) {
    console.log('err', error);
    return res.redirect(process.env.REACT_URL);
  }
});

app.get('/auth/google/failure', async (req, res) => {
  return res.redirect(process.env.REACT_URL);
});
// LinkedIn Oauth

app.get(
  '/api/v1/auth/linkedin',
  passport.authenticate('linkedin', {
    scope: ['r_liteprofile', 'r_emailaddress']
  })
);
app.get(
  '/api/v1/auth/linkedin/callback',
  passport.authenticate('linkedin', {
    successReturnToOrRedirect: '/auth/linkedin/success',
    failureRedirect: '/auth/linkedin/failure'
  })
);
//success
app.get('/auth/linkedin/success', async (req, res) => {
  try {
    const profile = req.user;

    const email = req.user.emails[0].value;
    const user = await User.findOne({ email: email });
    if (user) {
      const token = user.getSignedJwtToken();

      if (user.status === 'linkedInSignup') {
        return res.redirect(process.env.REACT_URL + `?SignupBylinkedIn=true&&user=${token}`);
      } else {
        return res.redirect(process.env.REACT_URL + `linkedInLogin?token=${token}`);
      }
    } else {
      let newUser = await User.create({
        role: 'user',
        status: 'linkedInSignup',
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: email,
        isSignupBylinkedIn: true
      });
      const token = newUser.getSignedJwtToken();

      return res.redirect(process.env.REACT_URL + `?SignupBylinkedIn=true&&user=${token}`);
    }
  } catch (error) {
    return res.redirect(process.env.REACT_URL);
  }
});

// failure
app.get('/auth/linkedin/failure', async (req, res) => {
  return res.redirect(process.env.REACT_URL);
});
