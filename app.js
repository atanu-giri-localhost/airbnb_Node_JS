// Core Module
const path = require('path');


// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const DB_PATH = "mongodb+srv://admin:admin@cluster0.1u7jlfu.mongodb.net/airbnb?appName=Cluster0";
const { default: mongoose } = require('mongoose');
const multer = require('multer');

//Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
});

const randomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  }, 
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + randomString(5) + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);  
  } else {
    cb(null, false);
  }
}
const multerOptions = {
  storage: storage,
  fileFilter: fileFilter
}
app.use(express.urlencoded({ extended: false }));
app.use(multer(multerOptions).single('photo'));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

app.use(session({
  secret: "AirNest by Atanu",
  resave: false,
  saveUninitialized: false,
  store
}));

app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

app.use(authRouter);
app.use((req, res, next) => {
  console.log(req.session.isLoggedIn);
  // console.log(req.session.user);
  next();
});
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if(req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);


app.use(errorsController.pageNotFound);

const PORT = 3000;

// const DB_PATH = "mongodb+srv://admin:admin@cluster0.1u7jlfu.mongodb.net/airbnb?appName=Cluster0";
mongoose.connect(DB_PATH).then(() => {
  console.log("Conneccted to Mongo");
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(error => {
  console.log("Error while connecting to Mongo", error);
});
