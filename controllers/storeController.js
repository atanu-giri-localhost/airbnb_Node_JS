const Home = require("../models/home");
const User = require("../models/user");
const path = require("path");
const rootDir = require("../utils/pathUtil");

exports.getIndex = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "AirNest – Full Stack Rental Marketplace",
      currentPage: "index",
       isLoggedIn: req.isLoggedIn,
    user: req.session.user,
    })});
}

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
    user: req.session.user,
    })
  }
  );
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user, 
  })
};

exports.getFavouriteList = async (req, res, next) => {
  if (!req.isLoggedIn || !req.session.user) {
    return res.redirect("/login");
  }
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  const favouriteHomes = user.favourites;
    res.render("store/favourite-list", {
      favouriteHomes: favouriteHomes,
      pageTitle: "My Favourites",
      currentPage: "favourites",
      isLoggedIn: req.isLoggedIn,
    user: req.session.user, 
    });
};

exports.getHomeDetail = (req, res, next) => {
  const homeId = req.params.homeId;
console.log("At home details page", homeId);
Home.findById(homeId)
.then((home) => {
  if (!home){
    console.log("Home not found");
    res.redirect("/homes");
  }
else{
  console.log("home found", home);
  res.render("store/home-detail", {
    home: home,
    pageTitle: "Home Detail",
    currentPage: "Home",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user, 
  })}
})}

exports.getHomeRules = [(req, res, next) => {
  if(!req.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
},
  (req, res, next) => {
  const homeId = req.params.homeId;
  const rulesFilename = `${homeId}-Rules.pdf`;
  const filePath = path.join(rootDir, 'rules', rulesFilename);
  res.download(filePath, rulesFilename, (err) => {
    if (err) {
      console.log("Error downloading file", err);
      return res.status(500).send("Error downloading file");
    }
  }
  );
  }
]
exports.postAddToFavourite = async (req, res, next) => {
  if (!req.isLoggedIn || !req.session.user) {
    return res.redirect("/login");
  }
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if(user.favourites.includes(homeId)) {
    console.log("Home already in favourites");
    return res.redirect('/favourites');
  }
  user.favourites.push(homeId);
  await user.save().then(result => {
    console.log("Fav added:", result);
  }).catch(error => {
    console.log("Error while adding favourite", error);
  }).finally(() => {
  res.redirect('/favourites');
  })
}


exports.postRemoveFromFavourite = async (req, res, next) => {
  if (!req.isLoggedIn || !req.session.user) {
    return res.redirect("/login");
  }
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if(user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(favHomeId => favHomeId != homeId);
    await user.save();
  }
    res.redirect('/favourites');
}
