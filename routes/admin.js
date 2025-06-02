const express = require("express");
const Controller = require("../controller/admin");
const passport = require("passport");
const multer = require("multer");
const Product = require("../model/product");
const User = require("../model/user");
const { isAdminLoggedIn } = require("../middleware/auth");

const router = express.Router();

const upload = multer({ dest: "uploads/" }); // Temporary local storage

// Public routes
router.get("/", (req, res) => {
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");
  return res.render("admin/login", {
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
  });
});

// Authentication routes
router.post(
  "/login",
  passport.authenticate("admin.login", {
    failureRedirect: "/admin/",
    failureFlash: true,
    successRedirect: "/admin/homepage",
  })
);

// Private routes - require admin authentication
router.get("/createadmin", isAdminLoggedIn, (req, res) => {
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");

  return res.render("admin/createadmin", {
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
  });
});

router.get("/homepage", isAdminLoggedIn, (req, res) => {
  return res.render("admin/homepage");
});

router.get("/createproduct", isAdminLoggedIn, (req, res) => {
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");

  return res.render("admin/createproduct", {
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
  });
});

router.get("/updateproduct", isAdminLoggedIn, (req, res) => {
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");

  return res.render("admin/updateproduct", {
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
  });
});

router.get("/updateimage", isAdminLoggedIn, (req, res) => {
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");

  return res.render("admin/updateproductImg", {
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
  });
});

router.get("/checkproduct", async (req, res) => {
  let errMsg = [];
  let successMsg = [];
  try {
    const successMsg = req.flash("success");
    const errMsg = req.flash("error");
    const product = await Product.find();

    return res.render("admin/checkproduct", {
      hasErr: errMsg.length > 0,
      hasSuccess: successMsg.length > 0,
      errMsg: errMsg,
      successMsg: successMsg,
      product: product,
    });
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    return res.redirect("/admin/checkproduct");
  }
});
router.get("/checkuser", isAdminLoggedIn, async (req, res) => {
  let errMsg = [];
  try {
    const successMsg = req.flash("success");
    const errMsg = req.flash("error");
    const user = await User.find();

    return res.render("admin/checkusers", {
      hasErr: errMsg.length > 0,
      hasSuccess: successMsg.length > 0,
      errMsg: errMsg,
      successMsg: successMsg,
      user: user,
    });
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    return res.redirect("/admin/checkuser");
  }
});
router.post("/createadmin", isAdminLoggedIn, Controller.createAdmin);
router.post(
  "/createproduct",
  isAdminLoggedIn,
  upload.single("image"),
  Controller.createProduct
);
router.post("/updateproduct", isAdminLoggedIn, Controller.updateProduct);
router.post(
  "/updateimage",
  isAdminLoggedIn,
  upload.single("image"),
  Controller.updateProductImg
);
router.get("/deleteproduct/:id", isAdminLoggedIn, Controller.deleteProduct);

router.get("/checkorders", isAdminLoggedIn, async (req, res) => {
  let errMsg = [];
  try {
    const successMsg = req.flash("success");
    const errMsg = req.flash("error");
    // Assuming you have an Order model
    // const orders = await Order.find().populate('user');

    // For now, we'll just render a template without orders
    return res.render("admin/checkorders", {
      hasErr: errMsg.length > 0,
      hasSuccess: successMsg.length > 0,
      errMsg: errMsg,
      successMsg: successMsg,
      orders: [], // Replace with actual orders when available
    });
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    return res.redirect("/admin/homepage");
  }
});

// Admin logout route
router.get("/logout", isAdminLoggedIn, (req, res, next) => {
  try {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.flash("success", "Admin successfully logged out");
      res.redirect("/admin");
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
