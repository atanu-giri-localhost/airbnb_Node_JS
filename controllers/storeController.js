const Home = require("../models/home");
const User = require("../models/user");

exports.getIndex = (req, res, next) => {
  Home.find().then((registeredHomes, fields) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
       isLoggedIn: req.isLoggedIn,
    user: req.session.user,
    })});
}

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes, fields) => {
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
  // const homes = home[0];
  console.log("home found", home);
  res.render("store/home-detail", {
    home: home,
    pageTitle: "Home Detail",
    currentPage: "Home",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user, 
  })}
})}


exports.postAddToFavourite = async (req, res, next) => {
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
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if(user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(favHomeId => favHomeId != homeId);
    await user.save();
  }
    res.redirect('/favourites');
}
