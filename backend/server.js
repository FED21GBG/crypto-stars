const express = require("express");
const cors = require("cors");
const app = express();
const nedb = require("nedb-promise");
const bcryptFunction = require("./bcrypt");
const jwt = require("jsonwebtoken");

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

const accountsDB = new nedb({ filename: "accounts.db", autoload: true });

//sign up
app.post("/api/signup", async (request, response) => {
  const credentials = request.body;

  const resObj = {
    success: true,
    userNameExist: false,
    userEmailExist: false,
  };

  const findUser = await accountsDB.find({
    username: credentials.username,
  });
  const findEmail = await accountsDB.find({
    email: credentials.email,
  });

  if (findUser.length > 0) {
    resObj.userNameExist = true;
  }

  if (findEmail.length > 0) {
    resObj.userEmailExist = true;
  }
  if (resObj.userEmailExist || resObj.userNameExist) {
    resObj.success = false;
  } else {
    resObj.success = true;
    const hashPass = await bcryptFunction.hashPassword(credentials.password);
    credentials.password = hashPass;
    accountsDB.insert(credentials);
  }
  response.json(resObj);
});

//login
app.post("/api/login", async (request, response) => {
  const credentials = request.body;
  const resObj = {
    success: false,
    user: "",
    token: "",
  };
  const findAccount = await accountsDB.find({ username: credentials.username });

  if (findAccount.length > 0) {
    const samePassword = await bcryptFunction.comparePassword(
      credentials.password,
      findAccount[0].password
    );
    if (samePassword) {
      resObj.user = findAccount[0].username;
      resObj.success = true;
    }
    const token = jwt.sign({ username: findAccount[0].username }, "fiskmås", {
      expiresIn: 600,
    });
    resObj.token = token;
  }
  response.json(resObj);
});

//add photo

//delete photo

//log out

app.listen(2009, () => {
  console.log("Server listening to port 2009");
});
