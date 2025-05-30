const express = require("express");
const passport = require("passport");
const Controller = require("../controller/user");
const Cart = require("../model/cart");
const upload = require("../config/multer");
const Product = require("../model/product");
const Order = require("../model/order");
const { isUserLoggedIn } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", (req, res) => {
  return res.json("welcome to user index routes");
});

router.get("/signup", (req, res) => {
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");

  return res.render("user/signup", {
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
  });
});

router.get("/login", (req, res) => {
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");

  return res.render("user/login", {
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
  });
});
router.post(
  "/login",
  passport.authenticate("user.login", {
    failureRedirect: "/user/login",
    failureFlash: true,
    successRedirect: "/",
  })
);

// Private routes - require authentication
router.get("/profile", isUserLoggedIn, async (req, res) => {
  try {
    const successMsg = req.flash("success");
    const errMsg = req.flash("error");
    const user = req.user;

    // Find recent orders for this user
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 })
      .limit(5); // Show only the 5 most recent orders

    return res.render("user/profile", {
      hasErr: errMsg.length > 0,
      hasSuccess: successMsg.length > 0,
      errMsg: errMsg,
      successMsg: successMsg,
      user: user,
      orders: orders,
    });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/");
  }
});
router.get("/addtocart/:id", Controller.addToCart);
router.get("/checkcart", (req, res) => {
  const cart = new Cart(req.session.cart);
  return res.json({
    cart: cart.generateArray(),
  });
});
router.get("/shoppingcart", (req, res) => {
  if (!req.session.cart) {
    return res.render("user/shoppingcart", {
      product: null,
      cart: null,
      hasErr: false,
      hasSuccess: false,
      errMsg: [],
      successMsg: [],
    });
  }

  const cart = new Cart(req.session.cart);
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");

  return res.render("user/shoppingcart", {
    product: cart.generateArray(),
    cart: req.session.cart,
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
  });
});
router.get("/createorder", async (req, res) => {
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");
  const user = req.user;
  let totalPrice = 0;
  if (req.session.cart) {
    totalPrice = req.session.cart.totalPrice;
  }

  return res.render("user/createorder", {
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
    user: user,
    totalPrice,
  });
});
router.get("/settings", isUserLoggedIn, (req, res) => {
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");
  const user = req.user;

  return res.render("user/settings", {
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
    user: user,
  });
});
router.get("/inputpin", isUserLoggedIn, (req, res) => {
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");
  const user = req.user;

  return res.render("user/inputpin", {
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
    user: user,
  });
});
router.get("/warning", (req, res) => {
  return res.render("user/warningpage");
});
router.post(
  "/signup",
  passport.authenticate("user.signup", {
    failureRedirect: "/user/signup",
    failureFlash: true,
    successRedirect: "/",
  })
);
router.post("/settings/profile", isUserLoggedIn, Controller.updateProfile);
router.post(
  "/settings/changepassword",
  isUserLoggedIn,
  Controller.changePassword
);
router.post(
  "/settings/profilepics",
  isUserLoggedIn,
  upload.single("image"),
  Controller.changeProfilePic
);

router.post("/createorder", isUserLoggedIn, Controller.createOrder);

// Product routes - public
router.get("/product/:id", async (req, res) => {
  let errMsg = [];
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      errMsg.push("Product not found");
      req.flash("error", errMsg);
      return res.redirect("/");
    }

    const user = req.user;
    let cart = req.session.cart;
    const successMsg = req.flash("success");
    const errMsg = req.flash("error");

    return res.render("user/product-details", {
      product: product,
      cart: cart,
      user: user,
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

// Route to reduce item quantity in cart
router.get("/reduce/:id", (req, res, next) => {
  try {
    const productId = req.params.id;

    // Check if cart exists in session
    if (!req.session.cart) {
      req.flash("error", "Cart is empty");
      return res.redirect("/user/shoppingcart");
    }

    const cart = new Cart(req.session.cart);

    cart.reduceByOne(productId);
    req.session.cart = cart;

    // If cart is empty after removing item, remove cart from session
    if (cart.totalQty <= 0) {
      delete req.session.cart;
    }

    req.flash("success", "Item quantity reduced");
    res.redirect("/user/shoppingcart");
  } catch (err) {
    return next(err);
  }
});

// Route to remove item from cart
router.get("/remove/:id", (req, res, next) => {
  try {
    const productId = req.params.id;

    // Check if cart exists in session
    if (!req.session.cart) {
      req.flash("error", "Cart is empty");
      return res.redirect("/user/shoppingcart");
    }

    const cart = new Cart(req.session.cart);

    cart.removeItem(productId);
    req.session.cart = cart;

    // If cart is empty after removing item, remove cart from session
    if (cart.totalQty <= 0) {
      delete req.session.cart;
    }

    req.flash("success", "Item removed from cart");
    res.redirect("/user/shoppingcart");
  } catch (err) {
    return next(err);
  }
});

// Route to display checkout page
router.get("/checkout", isUserLoggedIn, (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/user/shoppingcart");
  }

  const cart = new Cart(req.session.cart);
  const successMsg = req.flash("success");
  const errMsg = req.flash("error");

  return res.render("user/checkout", {
    total: cart.totalPrice,
    cart: req.session.cart,
    hasErr: errMsg.length > 0,
    hasSuccess: successMsg.length > 0,
    errMsg: errMsg,
    successMsg: successMsg,
    user: req.user,
  });
});

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please sign in to checkout");
  res.redirect("/user/login");
}

// Logout route
router.get("/logout", isUserLoggedIn, (req, res, next) => {
  try {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.flash("success", "Successfully logged out");
      res.redirect("/");
    });
  } catch (err) {
    return next(err);
  }
});

// Order routes - all private
router.get("/orders", isUserLoggedIn, async (req, res) => {
  try {
    const successMsg = req.flash("success");
    const errMsg = req.flash("error");

    // Find all orders for the current user
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 }); // Sort by newest first

    return res.render("user/order", {
      orders: orders,
      hasErr: errMsg.length > 0,
      hasSuccess: successMsg.length > 0,
      errMsg: errMsg,
      successMsg: successMsg,
      user: req.user,
    });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/user/profile");
  }
});

router.get("/order/:id", isUserLoggedIn, async (req, res) => {
  try {
    const successMsg = req.flash("success");
    const errMsg = req.flash("error");

    // Find the specific order by ID and make sure it belongs to the current user
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("items.product");

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/user/orders");
    }

    return res.render("user/order-details", {
      order: order,
      hasErr: errMsg.length > 0,
      hasSuccess: successMsg.length > 0,
      errMsg: errMsg,
      successMsg: successMsg,
      user: req.user,
    });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/user/orders");
  }
});

// Route to cancel an order
router.get("/order/cancel/:id", isUserLoggedIn, async (req, res) => {
  try {
    // Find the specific order by ID and make sure it belongs to the current user
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/user/orders");
    }

    // Check if order can be cancelled (only pending or processing orders)
    if (order.status !== "Pending" && order.status !== "Processing") {
      req.flash("error", "This order cannot be cancelled");
      return res.redirect(`/user/order/${order._id}`);
    }

    // Update order status to cancelled
    order.status = "Cancelled";
    await order.save();

    req.flash("success", "Order has been cancelled");
    return res.redirect("/user/orders");
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/user/orders");
  }
});

module.exports = router;
