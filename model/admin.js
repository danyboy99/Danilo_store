const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Make sure the model name is 'Admin' with capital A to match the constructor.modelName check
const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;
