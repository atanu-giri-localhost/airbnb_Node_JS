// Core Module
const path = require('path');


// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const DB_PATH = "mongodb+srv://admin:admin@cluster0.1u7jlfu.mongodb.net/airbnb?appName=Cluster0";
//Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
// const {mongoConnect} = require('./utils/databaseUtil');
const { default: mongoose } = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
})
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: "airbnb by Atanu",
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

app.use(express.static(path.join(rootDir, 'public')))

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