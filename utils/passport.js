var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "GOOGLE_OAUTH_CLIENT_ID_REDACTED",
      clientSecret: "GOOGLE_OAUTH_SECRET_REDACTED",
      callbackURL: "/auth/google/callback",
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
