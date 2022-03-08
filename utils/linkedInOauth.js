var passport = require("passport");
var LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.IND_Client_ID,
      clientSecret: process.env.IND_Client_SECRET,
      callbackURL: "/api/v1/auth/linkedin/callback",
      scope: ["r_liteprofile", "r_emailaddress"],
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
