const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const Gallery = require("../models/Gallery");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../../frontend/assets/gallery");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });
exports.uploadMiddleware = upload.single("image");

exports.UploadImage = async (req, res) => {
  try {
    const { description } = req.body;
    const id = uuidv4();
    const imageUrl = `assets/gallery/${req.file.filename}`;

    const newEntry = new Gallery({ id, description, imageUrl });
    await newEntry.save();

    res.status(201).json({ message: "Upload successful", newEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload image" });
  }
};
