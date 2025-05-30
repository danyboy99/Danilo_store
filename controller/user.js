const User = require("../model/user");
const Cart = require("../model/cart");
const Product = require("../model/product");
const Order = require("../model/order");
const flutterWave = require("flutterwave-node-v3");
const argon = require("argon2");
const flw = new flutterWave(
  "FLWPUBK_TEST-d8a5d2c77fd8d4ecfcfca5d95161e06b-X",
  "FLWSECK_TEST-42c6b907b1087f5d1a51e8602cabe713-X"
);
const addToCart = async (req, res) => {
  let errMsg = [];
  try {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    const foundProduct = await Product.findById(productId);
    if (!foundProduct) {
      let message = "no product with this ID found !!";
      errMsg.push(message);
      req.flash("error", errMsg);
      return res.redirect("/");
    }
    cart.add(foundProduct, foundProduct._id);
    req.session.cart = cart;
    return res.redirect("/");
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    return res.redirect("/");
  }
};
// Create order function
const createOrder = async (req, res) => {
  try {
    if (!req.session.cart) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/user/shoppingcart");
    }

    const cart = new Cart(req.session.cart);
    const user = req.user;

    // Create order items from cart
    const items = cart.generateArray().map((item) => {
      return {
        product: item.item._id,
        quantity: item.qty,
        price: item.price,
      };
    });

    // Create new order
    const order = new Order({
      user: user._id,
      items: items,
      totalPrice: cart.totalPrice,
      shippingAddress: user.address || req.body.address,
    });

    await order.save();

    // Clear the cart
    delete req.session.cart;

    req.flash("success", "Order placed successfully!");
    return res.redirect("/user/order/" + order._id);
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/user/checkout");
  }
};
const updateProfile = async (req, res) => {
  let errMsg = [];
  let successMsg = [];
  try {
    const { fullname, email, address } = req.body;
    const foundUser = await User.findById(req.user._id);
    if (fullname) {
      foundUser.fullname = fullname;
    }
    if (email) {
      foundUser.email = email;
    }
    if (address) {
      foundUser.address = address;
    }
    await foundUser.save();
    let message = "profile updated successfuly !";
    successMsg.push(message);
    req.flash("successs", successMsg);
    return res.redirect("/user/settings");
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    return res.redirect("/user/settings");
  }
};
const changePassword = async (req, res) => {
  let errMsg = [];
  let successMsg = [];
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const user = req.user;
    const foundUser = await User.findById(user._id);
    // if the old password is correct
    let isPasswordCorrect = await argon.verify(foundUser.password, oldPassword);
    if (!isPasswordCorrect) {
      let message = "incorrect password";
      errMsg.push(message);
      req.flash("error", errMsg);
      return res.redirect("/user/settings");
    }
    if (newPassword === confirmNewPassword) {
      let message = "new password must match confirm password";
      errMsg.push(message);
      req.flash("error", errMsg);
      return res.redirect("/user/settings");
    }
    let hashPassword = await argon.hash(newPassword);
    foundUser.password = hashPassword;
    await foundUser.save();
    successMsg.push("password change successfuly !");
    req.flash("success", successMsg);
    return res.redirect("/user/settings");
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    return res.redirect("/user/settings");
  }
};
const changeProfilePic = async (req, res) => {
  let errMsg = [];
  let successMsg = [];
  try {
    const user = req.user;
    if (user.profilepics) {
      fs.unlink(user.profilepics, (err) => {
        if (err) {
          console.error("Failed to delete image:", err);
        } else {
          console.log("Image deleted successfully.");
        }
      });
    }
    const foundUser = await User.findById(user._id);
    foundUser.profilepics = req.file.path;
    await foundUser.save();
    successMsg.push("profile pics updated successsfuly !!");
    req.flash("success", successMsg);
    return res.redirect("/user/settings");
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    return res.redirect("/user/settings");
  }
};
const inputPin = async (req, res) => {
  let errMsg = [];
  let successMsg = [];
  try {
    const pin = req.body.pin;
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    return res.redirect("/user/inputpin");
  }
};
module.exports = {
  addToCart,
  createOrder,
  updateProfile,
  changePassword,
  changeProfilePic,
  inputPin,
};
