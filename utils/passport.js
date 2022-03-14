var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GCP_Client_ID,
      clientSecret: process.env.GCP_Client_Secret,
      callbackURL: process.env.Google_Callback,
      scope: ["profile"],
      state: true,
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);

passport.serializeUser(function (profile, done) {
  done(null, profile);
});

passport.deserializeUser(function (profile, done) {
  done(null, profile);
});
