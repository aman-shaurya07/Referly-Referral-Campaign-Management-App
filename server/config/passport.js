const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Business = require('../models/Business'); // Import Business model

passport.serializeUser((user, done) => {
  done(null, user.id); // use MongoDB _id
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Business.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const existingBusiness = await Business.findOne({ googleId: profile.id });

    if (existingBusiness) {
      return done(null, existingBusiness);
    }

    const newBusiness = new Business({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      profilePic: profile.photos[0].value,
    });

    await newBusiness.save();
    return done(null, newBusiness);

  } catch (err) {
    return done(err, null);
  }
}));
