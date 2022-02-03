const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "GOOGLE_OAUTH_CLIENT_ID_REDACTED",
      clientSecret: "GOOGLE_OAUTH_SECRET_REDACTED",
      callbackURL: "http://localhost:9190/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
