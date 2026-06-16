const Home = require("../models/home");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to AirNest",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === 'true';
  
  Home.findById(homeId).then((home) => {
  if(!home) {
    console.log("home not found for editing");
    return res.redirect("/host/host-home-list")
  }
  // const homes = home[0];
  // console.log(homeId, editing, home);
    res.render("host/edit-home", {
    home: home,
    pageTitle: "Edit Home on AirNest",
    currentPage: "host-homes",
    editing: editing, 
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().then((registeredHomes, fields) => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
       isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    })
  }
  );
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating,  description, id } = req.body;
  const photo = req.file ? req.file.path : null;
  const home = new Home({houseName, price, location, rating, photo,description, id});
  home.save().then(() => {
    console.log("home added successfuly");
  });

  res.redirect("/host/host-home-list")
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, photo, description } = req.body;
  Home.findById(id).then((home) => {
    
    home.houseName = houseName;
    home.price = price;
    home.location = location;
    home.rating = rating;
    home.description = description;
    if(req.file) {
      fs.unlink(home.photo, (err) => {
        if (err) {
          console.log("Error deleting old photo", err);
        }
      });
      home.photo = req.file.path;
    }
    
    home.save().then((result) => {
      console.log("Home updated", result);
    }).catch(error => {
    console.log("error while updating home", error);
  }) 
  res.redirect("/host/host-home-list")
}).catch(error => {
    console.log("error while finding home", error);
  })}

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId; 
  Home.findByIdAndDelete(homeId).then(() =>{
    res.redirect("/host/host-home-list")})
    
  };
