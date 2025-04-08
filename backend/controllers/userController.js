const User = require("../models/User");

exports.registerUser = async (req, res) => {
  const {
    username,
    email,
    password,
    roles = ["user"],
    personalInfo,
  } = req.body;

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) return res.status(400).json({ message: "User already exists" });

  const newUser = new User({
    username,
    email,
    password,
    roles,
    personalInfo,
  });

  await newUser.save();
  res.status(201).json({ message: "User registered" });
};
