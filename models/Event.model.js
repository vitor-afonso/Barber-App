//jshint esversion:8
const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
    {
        service: [{
            type: String
        }],
        start_date: {
            type: Date 
        },
        message: {
            type: String, 
        },

        authorID:  { type: Schema.Types.ObjectId, ref: "User" },

        reqStatus: {
            type: String, 
        }
    },
    {
        timestamps: true,
    }
);

const Event = model("Event", eventSchema);

module.exports = Event;
