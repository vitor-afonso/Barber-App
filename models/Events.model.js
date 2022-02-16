//jshint esversion:8

const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the event model to whatever makes sense in this case
const eventSchema = new Schema(
    {
        text: String,
        start_date: {
            type: Date, 
            require: true,
        // unique: true -> Ideally, should be unique, but its up to you
        },
        end_date: {
            type: Date, 
            require: true,
        // unique: true -> Ideally, should be unique, but its up to you
        }
    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`
        timestamps: true,
    }
);

const Event = model("Event", eventSchema);

module.exports = Event;
