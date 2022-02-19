//jshint esversion:8
const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    stars: {
      type: Number,
      min: 1,
      max: 5
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
  },
  {
    timestamps: true,
  }
);

const Review = model("Review", reviewSchema);

module.exports = Review;
