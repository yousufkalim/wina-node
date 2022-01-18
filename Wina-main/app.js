const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv").config();
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
var GoogleStrategy = require("passport-google-oauth2").Strategy;
const MongoStore = require("connect-mongo")(session);
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const async = require("async");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const socketio = require("socket.io");
const http = require("http");
var cors = require("cors");
const logger = require("morgan");
const app = express();
const server = http.createServer(app);
var xlsx = require("xlsx");
const notificationService = require("./socket.io/notifications");
app.use(cors());

//// Body Parser Middleware ////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  console.log("Reading the spreadsheet..");
  const workbook = xlsx.readFile("./public/skills.xlsx");
  const sheets = workbook.SheetNames;
  var xlData = workbook.Sheets[sheets[0]];
  let jsonData = xlsx.utils.sheet_to_json(xlData);

  console.log("Raeding second sheet...", sheets);

  res.json({ message: "success", jsonData });
});
// Morgan
app.use(logger("dev"));

//// Cookie Parser ////

app.use(cookieParser());

//// PUBLIC Folrders Configuartion ////

app.use("/assets", express.static("assets"));
app.use("/views", express.static("views"));

// socket io connection
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

//// Sessions Middleware ////

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//// DataBase Connection ////

mongoose
  .connect(process.env.Database_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Database has connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

// Initializing Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//// Routes ////
const auth = require("./routes/auth");
const student = require("./routes/student");
const company = require("./routes/company");
const studentConsultant = require("./routes/studentConsultant");
const companyConsultant = require("./routes/companyConsultant");
const profile = require("./routes/profile");
const admin = require("./routes/admin");
const job = require("./routes/job");
const FileUpload = require("./routes/FileUpload");

//// Mount Routers ////

app.use("/api/v1/auth", auth);
app.use("/api/v1/student", student);
app.use("/api/v1/company", company);
app.use("/api/v1/student-consultant", studentConsultant);
app.use("/api/v1/company-consultant", companyConsultant);
app.use("/api/v1/profile", profile);
app.use("/api/v1/admin", admin);
app.use("/api/v1/job", job);
app.use("/api/v1", FileUpload);

// app.use("/api/v1/admin", admin);

//// Error Handler
app.use((error, req, res, next) => {
  console.log("Main Error =>", error);
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
io.on("connection", (socket) => {
  console.log("Connected");

  socket.on("sendnotification", (data) => {
    //console.log(data, "data dash");
    socket.broadcast.emit("sendnotification", data);
  });
  // logInfo.info(
  //   "Connection Established ",
  //   socket.id,
  //   " accepted at ",
  //   new Date().toJSON()
  // );
  exports.socket = { socket, io };
  var useris = socket.handshake.query.userConnectionId;
  socket.join(useris);
  //Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    socket.leave(useris);
  });

  // for dynamic notifications
  var recieverId = socket.handshake.query.recieverId;
  socket.on(`sendNotification`, (data) => {
    // logic to save notifications in our db
    notificationService
      .addNotifcation({
        id: data.id,
        title: data.title,
        message: data.message,
      })
      .then((message) => {
        socket.broadcast.emit(`recieveNotification${data.id}`, {
          title: data.title,
          message: data.message,
        });
      })
      .catch((e) => console.log(e));
  });
});

// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser(function (user, cb) {
//   cb(null, user);
// });

// passport.deserializeUser(function (obj, cb) {
//   cb(null, obj);
// });
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: "351494413149636",
//       clientSecret: "6dc8c994fa5b86cf78acc0372d4177b6",
//       callbackURL: "http://localhost:9190/auth/facebook/callback",
//     },
//     async function (accessToken, refreshToken, profile, cb) {
//       await User.findOne({ email: profile.email }, function (err, user) {
//         return cb(err, user);
//       });
//     }
//   )
// );

// app.get("/auth/facebook", passport.authenticate("facebook"));

// app.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", { failureRedirect: "/login" }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     res.json({ success: true, user: req });
//   }
// );

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID:
//         "GOOGLE_OAUTH_CLIENT_ID_REDACTED",
//       clientSecret: "GOOGLE_OAUTH_SECRET_REDACTED",
//       callbackURL: "http://localhost:9190/auth/google/callback",
//       passReqToCallback: true,
//     },
//     async function (request, accessToken, refreshToken, profile, done) {
//       await User.findOne({ email: profile.email }, function (err, user) {
//         return done(err, user);
//       });
//     }
//   )
// );

// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["email", "profile"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     successRedirect: "/auth/google/success",
//     failureRedirect: "/auth/google/failure",
//   })
// );

// app.get("/auth/google/success", async (req, res) => {
//   res.json({ success: true, user: req.user });
// });
