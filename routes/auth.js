const router = require("express").Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {registerValidation, loginValidation} = require("../validation");

router.post("/register", async (req, res) => {
  //Validate data before creating user.
  const {error} = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check if user is already in the database. -> if there are errors the function will be exited on the return.
  const emailExists = await User.findOne({email: req.body.email});
  if (emailExists) return res.status(400).send("Email already exists");

  //Hash password (hashed password = one part salt + one part hash)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //Create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    const savedUser = await user.save();
    res.send({user: user._id}); //Confirms user created
  } catch (err) {
    res.status(400).send(err);
  }
});

//Login
router.post("/login", async (req, res) => {
  const {error} = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //Check if the email exists.
  const user = await User.findOne({email: req.body.email});
  if (!user) return res.status(400).send("Email not found.");
  //Check if password is correct -> compare hashed password with password entered.
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid Password");

  //Create and assign json web token
  const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send(token);
});

module.exports = router;
