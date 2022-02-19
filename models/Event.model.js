//jshint esversion:8
const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
  {
    service: [
      {
        type: String,
        required: true,
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
    },
    contact: Number,

    authorID: { type: Schema.Types.ObjectId, ref: "User" },

    reqStatus: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Event = model("Event", eventSchema);

module.exports = Event;
