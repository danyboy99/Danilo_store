const passport = require("passport");
const Admin = require("../model/admin.js");
const User = require("../model/user.js");
const localStrategy = require("passport-local").Strategy;
const argon = require("argon2");

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const itsAdmin = await Admin.findById(id);
  const itsUser = await User.findById(id);
  if (itsAdmin) {
    return done(null, itsAdmin);
  }
  if (itsUser) {
    return done(null, itsUser);
  }
  let msg = " not found";
  return done(msg);
});

passport.use(
  "admin.login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      let errMsg = [];
      try {
        const foundAdmin = await Admin.findOne({ email });

        if (!foundAdmin) {
          let message = "no admin found with this email";
          errMsg.push(message);
          return done(null, false, req.flash("error", errMsg));
        }

        let isPasswordCorrect = await argon.verify(
          foundAdmin.password,
          password
        );

        if (!isPasswordCorrect) {
          let message = "incorrect password";
          errMsg.push(message);
          return done(null, false, req.flash("error", errMsg));
        }

        return done(null, foundAdmin);
      } catch (err) {
        errMsg.push(err.message);
        return done(null, false, req.flash("error", errMsg));
      }
    }
  )
);

passport.use(
  "user.signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      let errMsg = [];
      try {
        const foundUser = await User.findOne({ email });
        if (foundUser) {
          let message = "there is an account attached to this E-mail";
          errMsg.push(message);
          return done(null, false, req.flash("error", errMsg));
        }
        let hashPassword = await argon.hash(password);
        const { fullname, address } = req.body;
        const newUser = await User.create({
          fullname: fullname,
          email: email,
          password: hashPassword,
          address: address,
        });
        return done(null, newUser);
      } catch (err) {
        errMsg.push(err.message);
        return done(null, false, req.flash("error", errMsg));
      }
    }
  )
);

passport.use(
  "user.login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      let errMsg = [];
      try {
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
          let message = "no User found with this email";
          errMsg.push(message);
          return done(null, false, req.flash("error", errMsg));
        }
        let isPasswordCorrect = await argon.verify(
          foundUser.password,
          password
        );

        if (!isPasswordCorrect) {
          let message = "incorrect password";
          errMsg.push(message);
          return done(null, false, req.flash("error", errMsg));
        }
        return done(null, foundUser);
      } catch (err) {
        errMsg.push(err.message);
        return done(null, false, req.flash("error", errMsg));
      }
    }
  )
);
