const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/logIn", {
    pageTitle: "Login",
    currentPage: "Login",
    isLoggedIn: false,
    errors: [],
    oldInput: {},
    user: {}
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signUp", {
    pageTitle: "Signup",
    currentPage: "Signup",
    isLoggedIn: false,
    errors: [],
    oldInput: {},
    user: {}
  });
};


exports.postSignup = [
  check("firstName")
  .notEmpty()
  .withMessage("First Name is required.")
  .isLength({ min: 2 })
  .withMessage("First Name must be at least 2 characters long.")
  .matches(/^[A-Za-z]+$/)
  .withMessage("First Name must contain only alphabetic characters."),
  
  check("lastName")
  .notEmpty()
  .withMessage("Last Name is required.")
  .matches(/^[A-Za-z]+$/)
  .withMessage("Last Name must contain only alphabetic characters."),

  check("email")
  .notEmpty()
  .withMessage("Email is required.")
  .isEmail()
  .withMessage("Please enter a valid email address.")
  .normalizeEmail(),

  check("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long.")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter.")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter.")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number.")
  .matches(/[\W_]/)
  .withMessage("Password must contain at least one special character.")
  .trim(),
  
  check("confirmPassword")
  .trim()
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error ("Passwords do not match.");
    }
    return true;
  }),

  check("userType")
  .notEmpty()
  .withMessage("User Type is required.")
  .isIn(["host", "guest"])
  .withMessage("User Type must be either 'host' or 'guest'."),

  check("terms")
  .equals("on")
  .withMessage("You must accept the terms and conditions."),

  (req, res, next) => {
    console.log(req.body)
    const { firstName, lastName, email, userName, password, confirmPassword, userType } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signUp", {
        pageTitle: "Signup",
        currentPage: "Signup",
        isLoggedIn: false,
        errors: errors.array().map(err => err.msg),
        oldInput: { firstName, lastName, email, userName, userType },
        user: {}
      });
    }
    
    bcrypt.hash(password, 12).then(hashedPassword => {
      const user = new User({ firstName, lastName, email, userName, password: hashedPassword, userType });
      return user.save();
    })
    .then(() => { 
      res.redirect("/login");
    }).catch(err => {
      return res.status(422).render("auth/signUp", {
        pageTitle: "Signup",
        currentPage: "Signup",
        isLoggedIn: false,
        errors: [err.message],
        oldInput: { firstName, lastName, email, userName, userType },
        user: {}
      });
    });
}]

exports.postLogin = async (req, res, next) => {
  
  const {email, password} = req.body;
  console.log(email);
  const user = await User.findOne({email: email});
  if (!user) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["User does not exist"],
      oldInput: {email},
      user: {},
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["Invalid Password"],
      oldInput: {email},
      user: {},
    });
  }

  req.session.isLoggedIn = true;
  console.log(req.session.isLoggedIn);
  const safeUser = {
  _id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  userName: user.userName,
  userType: user.userType
};
  req.session.user = safeUser;
  // await req.session.save();
  req.session.save(err => {
  if (err) console.log(err);
  res.redirect("/");
});
  // res.redirect("/");
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");    
  });
};