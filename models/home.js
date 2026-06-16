const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const favourite = require('./favourite');

const homeSchema = mongoose.Schema({
  houseName: {type: String, required: true},
  price: {type: String, required: true},
  location: {type: String, required: true},
  rating: {type: String, required: true},
  photo: String,
  description: String
});

homeSchema.pre('findOneAndDelete', async function(next) {
  console.log('Came to pre hook while deleting a home');
  const homeId = this.getQuery()._id;
  await favourite.deleteMany({houseId: homeId});
  next();
});

module.exports = mongoose.model('Home', homeSchema);








/*
const { ObjectId } = require('mongodb');
const { getDB } = require('../utils/databaseUtil');

module.exports = class Home {
  constructor(houseName, price, location, rating, photo, description, _id) {
    this.houseName = houseName;
    this.price = price;
    this.location = location;
    this.rating = rating;
    this.photo = photo;
    this.description = description;
    if(_id){
      this._id = _id;
    }
  }

  save() {
    const db = getDB();
    const updatedFields = {
      houseName: this.houseName,
      price: this.price,
      location: this.location,
      rating: this.rating,
      photo: this.photo,
      description: this.description
    };
    if(this._id){
      return db.collection("homes").updateOne({_id: new ObjectId(String(homeId))}, {
        $set: updatedFields
      });
    } else {
    return db.collection("homes").insertOne(this).then((result) => {
      console.log(result);
    });
    }  
  }

  static find() {
    const db = getDB();
    return db.collection("homes").find().toArray();   
  }

  static findById(homeId) {
    const db = getDB();
    return db.collection("homes").find({_id: new ObjectId(String(homeId))}).next(); 
  }

  static deleteById(homeId, callback) {
    const db = getDB();
    return db.collection("homes").deleteOne({_id: new ObjectId(String(homeId))});
    }
}

*/