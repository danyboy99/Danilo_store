const mongoose = require("mongoose");

const { Schema } = mongoose;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  discription: {
    type: String,
    required: true,
  },
  size: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  reviews: {
    type: Number,
    default: 0,
  },
});

// Change from lowercase "product" to "Product" to match the reference in Order schema
const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
