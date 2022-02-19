//jshint esversion:8
const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    role: {
      type: String,
      enum:['Admin', 'User'],
      default: 'User'
    },
    password: {
      type: String,
      required: true
    },
    events:  [{ type: Schema.Types.ObjectId, ref: "Event" }],
    reviews:  [{ type: Schema.Types.ObjectId, ref: "Review" }],
    imageUrl: {
      type: String,
      default: '/../public/images/default-user-profile.jpeg'
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
