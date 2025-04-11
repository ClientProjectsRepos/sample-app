const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // GUID
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Gallery", gallerySchema);
