const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const adminRoutes = require("./routes/admin");
var session = require("express-session");
var passport = require("passport");
var flash = require("connect-flash");
var mongoStore = require("connect-mongo");
const userRoutes = require("./routes/user");
const Product = require("./model/product");
const tools = require("./config/tools");
const dotenv = require("dotenv");
const multer = require("multer");
const app = express();
dotenv.config();
// connect to database
let DB_URL = process.env.DB_url; // Changed from DB_URL to DB_url to match your .env file
mongoose
  .connect(DB_URL)
  .then(() => console.log("connected to mongoDB"))
  .catch((err) => console.log(err.message));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// config ejs view engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "Danilosessionsecret",
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({ mongoUrl: DB_URL }), // Make sure this uses the same variable
    cookie: { maxAge: 180 * 60 * 1000 }, // 3 hours
  })
);

app.use(flash());
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

app.get("/", async (req, res) => {
  const product = await Product.find();
  const catigoryList = await tools.catigoryList();
  const user = req.user;
  let Cart = req.session.cart;
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");
  return res.render("homepage", {
    product: product,
    cart: Cart,
    isLoggedin: req.isAuthenticated(),
    catigory: catigoryList,
    user: user,
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
  });
});
app.get("/category/:cat", async (req, res) => {
  let errMsg = [];
  try {
    const category = req.params.cat;
    const foundProduct = await Product.find({ category: category });
    const catigoryList = await tools.catigoryList();
    const user = req.user;
    let Cart = req.session.cart;
    const successMsg = req.flash("success");
    const errMsg = req.flash("error");

    return res.render("category", {
      product: foundProduct,
      cart: Cart,
      isLoggedin: req.isAuthenticated(),
      catigory: catigoryList,
      user: user,
      mainCat: category,
      hasErr: errMsg.length > 0,
      hasSuccess: successMsg.length > 0,
      errMsg: errMsg,
      successMsg: successMsg,
    });
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    return res.redirect("/");
  }
});
//admin route setup
app.use("/admin", adminRoutes);
// user route setup
app.use("/user", userRoutes);

app.get("/error", (req, res) => {
  const error = req.query.message || "Unknown error";
  res.status(500).render("errors/500", {
    error: { message: error },
  });
});

// Add this API endpoint to fetch related products
app.get("/api/related-products", async (req, res) => {
  try {
    const category = req.query.category;
    const excludeId = req.query.exclude;

    // Find products in the same category, excluding the current product
    const relatedProducts = await Product.find({
      category: category,
      _id: { $ne: excludeId },
    }).limit(4);

    return res.json({ products: relatedProducts });
  } catch (err) {
    console.error("Error fetching related products:", err);
    return res.status(500).json({ error: "Failed to fetch related products" });
  }
});

// Multer error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    let errMsg = [];

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        errMsg.push("File is too large");
        break;
      case "LIMIT_FILE_COUNT":
        errMsg.push("Too many files uploaded");
        break;
      case "LIMIT_UNEXPECTED_FILE":
        errMsg.push("Unexpected file type");
        break;
      default:
        errMsg.push("Error uploading file: " + err.message);
    }

    req.flash("error", errMsg);

    // Redirect based on the route
    if (req.originalUrl.includes("/admin/createproduct")) {
      return res.redirect("/admin/createproduct");
    } else if (req.originalUrl.includes("/admin/updateimage")) {
      return res.redirect("/admin/checkproduct");
    } else {
      return res.redirect("/");
    }
  }
  next(err);
});

let port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`app is listen on port ${port}`);
});

// 404 handler - This should come after all your routes
app.use((req, res, next) => {
  res.status(404).render("errors/404", {
    error: { message: `Cannot ${req.method} ${req.url}` },
  });
});

// General error handler - should be after all other middleware and routes
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);

  // If it's an AJAX request, send JSON
  if (req.xhr) {
    return res.json({ error: err.message });
  }

  // Otherwise render error page
  res.render("errors/500", {
    error: { message: err.message || "Internal Server Error" },
  });
});
