const Admin = require("../model/admin");
const argon = require("argon2");
const Product = require("../model/product");
const Tools = require("../config/tools");
const fs = require("fs");
const cloudinary = require("../config/tools").cloudinary;

// Function to create a new admin account

const createAdmin = async (req, res) => {
  let errMsg = [];
  let successMsg = [];
  try {
    const { fullname, email, password } = req.body;
    let hashPassword = await argon.hash(password);
    const createdAdmin = await Admin.create({
      fullname,
      email,
      password: hashPassword,
    });
    if (!createdAdmin) {
      let message = "account not created something went wrong";
      errMsg.push(message);
      req.flash("error", errMsg);
      return res.redirect("/admin/createadmin");
    }
    let message = "account created successfully";
    successMsg.push(message);
    req.flash("success", successMsg);
    return res.redirect("/admin/createadmin");
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    return res.redirect("/admin/createadmin");
  }
};
const createProduct = async (req, res, next) => {
  let errMsg = [];
  let successMsg = [];
  try {
    const { name, category, discription, size, price, stock } = req.body;

    // Check if file was uploaded
    // if (!req.file) {
    //   errMsg.push("Product image is required");
    //   req.flash("error", errMsg);
    //   return res.redirect("/admin/createproduct");
    // }
    const result = await cloudinary.uploader.upload(req.file.path); // Upload to Cloudinary
    fs.unlinkSync(req.file.path); // Remove the local file
    const imagePath = result.secure_url; // Get the secure URL from Cloudinary

    // Validate other required fields
    if (!name || !category || !price) {
      errMsg.push("Name, category and price are required fields");
      req.flash("error", errMsg);
      return res.redirect("/admin/createproduct");
    }

    const createdProduct = await Product.create({
      name,
      category,
      discription,
      size,
      price,
      stock,
      imagePath,
    });

    if (!createdProduct) {
      let message = "Something went wrong, product not created";
      errMsg.push(message);
      req.flash("error", errMsg);
      return res.redirect("/admin/createproduct");
    }

    let message = "Product created successfully (product is live!!)";
    successMsg.push(message);
    req.flash("success", successMsg);
    return res.redirect("/admin/createproduct");
  } catch (err) {
    // Pass to error handler middleware
    if (err.name === "ValidationError") {
      // Handle mongoose validation errors
      errMsg.push(
        Object.values(err.errors)
          .map((val) => val.message)
          .join(", ")
      );
      req.flash("error", errMsg);
      return res.redirect("/admin/createproduct");
    } else {
      // For other errors, use the error middleware
      return next(err);
    }
  }
};
const updateProduct = async (req, res) => {
  let errMsg = [];
  let successMsg = [];
  try {
    const { name, category, discription, size, price, stock } = req.body;
    const foundProduct = await Product.findOne({ name: name });
    if (!foundProduct) {
      let message = "no product found with this name !!";
      errMsg.push(message);
      req.flash("error", errMsg);
      return res.redirect("/admin/updateproduct");
    }
    if (category) {
      foundProduct.category = category;
    }
    if (discription) {
      foundProduct.discription = discription;
    }
    if (size) {
      foundProduct.size = size;
    }
    if (price) {
      foundProduct.price = price;
    }
    if (stock) {
      foundProduct.stock = stock;
    }

    await foundProduct.save();
    let message = "product updated successfully!!";
    successMsg.push(message);
    req.flash("success", successMsg);
    return res.redirect("/admin/updateproduct");
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    res.redirect("/admin/updateproduct");
  }
};
const updateProductImg = async (req, res) => {
  let errMsg = [];
  let successMsg = [];
  try {
    const { name } = req.body;
    const foundProduct = await Product.findOne({ name: name });
    if (!foundProduct) {
      let message = "no product found with this name";
      errMsg.push(message);
      req.flash("error", errMsg);
      return res.redirect("/admin/updateimage");
    }
    let message = "";
    fs.unlink(foundProduct.imagePath, (err) => {
      if (err) {
        console.error("Failed to delete image:", err);
      } else {
        console.log("Image deleted successfully.");
        message = "Image updated successfully.";
      }
    });
    foundProduct.imagePath = req.file.path;
    await foundProduct.save();
    successMsg.push(message);
    req.flash("success", successMsg);
    return res.redirect("/admin/updateimage");
  } catch (err) {}
};
const deleteProduct = async (req, res) => {
  let errMsg = [];
  let successMsg = [];
  try {
    const productId = req.params.id;
    await Product.findByIdAndDelete(productId);
    let message = "product deleted successfully";
    successMsg.push(message);
    req.flash("success", successMsg);
    return res.redirect("/admin/checkproduct");
  } catch (err) {
    errMsg.push(err.message);
    req.flash("error", errMsg);
    return res.redirect("/admin/checkproduct");
  }
};
module.exports = {
  createAdmin,
  createProduct,
  updateProduct,
  updateProductImg,
  deleteProduct,
};
