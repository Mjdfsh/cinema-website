const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");

const database = require("./databaseConfig");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

const checkUserCookie = (req, res, next) => {
  const isStaticFile = req.url.startsWith("/statics");
  const isLoggedIn =
    req.cookies.uid !== undefined &&
    req.cookies.uid !== null &&
    req.cookies.uid !== "";

  if (isStaticFile) {
    next();
  } else if (!isLoggedIn && req.url !== "/login" && req.url !== "/signup") {
    console.log("Redirecting to login");
    return res.redirect("/login");
  } else if ((req.url === "/login" || req.url === "/signup") && isLoggedIn) {
    console.log("Redirecting to /");
    return res.redirect("/");
  } else {
    next();
  }
};

app.use(checkUserCookie);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "aboutUs.html"));
});

app.get("/booking", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "booking.html"));
});

app.get("/films", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "films.html"));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  database.login(email, password, res);
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "login.html"));
});

app.get("/logout", (req, res) => {
  res.clearCookie("uid");
  res.redirect("/login");
});

app.post("/update", (req, res) => {
  const data = req.body;
  database.updateUser(data, req);
});

app.get("/profile", (req, res) => {
  const uid = req.cookies.uid;
  database.getUser(uid, (d) => {
    d = JSON.parse(JSON.stringify(d));
    d = d[0];
    d.birth_date = d.birth_date.split("T")[0];
    res.render(path.join(__dirname, "html", "profile.html"), { data: d });
  });
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "signUp.html"));
});

app.post("/signup", (req, res) => {
  const data = req.body;
  database.addUser(data);
  res.redirect("/login");
});

app.get("/snacks", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "snacks.html"));
});

app.use("/statics", express.static(path.join(__dirname, "statics")));

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
