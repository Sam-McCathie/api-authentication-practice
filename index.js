const express = require("express");
const app = express();
const port = 3001;
const mongoose = require("mongoose");
require("dotenv").config();

//Import Routes
const authRoute = require("./routes/auth");

//Connect to DB
mongoose.connect(
  process.env.DB_CONNECTION,
  {useNewUrlParser: true, useUnifiedTopology: true},
  () => console.log("Connected to DB")
);

//Middleware
app.use(express.json());

//Route middlewares
app.use("/api/user", authRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
