//jshint esversion:8
const { Schema, model } = require("mongoose");


const adminSchema = new Schema(
  {
    username: {
      type: String,
      unique: true 
    },
    email: {
      type: String,
      unique: true 
    },
    password: String
  },
  {
    timestamps: true,
  }
);

const Admin = model("Admin", adminSchema);

module.exports = Admin;