const User = require("../models/User");

exports.registerUser = async (req, res) => {
  const {
    username,
    email,
    roles = ["user"],
    personalInfo,
  } = req.body;

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) return res.status(400).json({ message: "User already exists" });

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    return Array.from({ length: 8 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const generatedPassword = generatePassword()

  const newUser = new User({
    username,
    email,
    password: generatedPassword,
    roles,
    personalInfo,
  });

  await newUser.save();
  const fileContent = `Your account has been created.\n\nUsername: ${username}\nEmail: ${email}\nPassword: ${generatedPassword}\n`;

    res.setHeader("Content-Disposition", `attachment; filename=${username}_credentials.txt`);
    res.setHeader("Content-Type", "text/plain");

    res.status(201).send(fileContent);
};

exports.profile = async (req, res) => {
  User.findById(req.user.id).select('-password').then(user => {
    res.json(user);
  });
};
