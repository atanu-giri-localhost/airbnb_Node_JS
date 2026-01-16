const Favourite = require("../models/favourite");
const Home = require("../models/home");

exports.getIndex = (req, res, next) => {
  Home.find().then((registeredHomes, fields) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
    })});
}

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes, fields) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
    })
  }
  );
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
  })
};

exports.getFavouriteList = (req, res, next) => {
  Favourite.find()
  .populate('houseId')
  .then((favourites) => {
    const favouriteHomes = favourites.map((fav) => fav.houseId);
    res.render("store/favourite-list", {
      favouriteHomes: favouriteHomes,
      pageTitle: "My Favourites",
      currentPage: "favourites",
    });
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
  })}
})}


exports.postAddToFavourite = (req, res, next) => {
  const homeId = req.body.id;
  Favourite.findOne({ houseId: homeId }).then(existingfav => {
    if(existingfav) {
      return 
    }
    const fav = new Favourite({ houseId: homeId });
    return fav.save();
  }).catch(error => {
    console.log("Error while marking favourites", error);
  }).finally(() => {
    console.log("redirecting to favourites")
    res.redirect('/favourites');
  }) 
}


exports.postRemoveFromFavourite = (req, res, next) => {
  const homeId = req.params.homeId;
  Favourite.findOneAndDelete(homeId).then(result => {
    console.log("Fav removed:", result);
  }).catch(error => {
    console.log("Error while removing favourite", error);
  }).finally(() => {
    console.log("redirecting to favourites")
    res.redirect('/favourites');
  });
}
