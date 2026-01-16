// Core Module
const path = require('path');


// External Module
const express = require('express');

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const {mongoConnect} = require('./utils/databaseUtil');
const { default: mongoose } = require('mongoose');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded());
app.use(storeRouter);
app.use("/host", hostRouter);

app.use(express.static(path.join(rootDir, 'public')))

app.use(errorsController.pageNotFound);

const PORT = 3000;

const DB_PATH = "mongodb+srv://admin:admin@cluster0.1u7jlfu.mongodb.net/airbnb?appName=Cluster0";
mongoose.connect(DB_PATH).then(() => {
  console.log("Conneccted to Mongo");
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(error => {
  console.log("Error while connecting to Mongo", error);
});