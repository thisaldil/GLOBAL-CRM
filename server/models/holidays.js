// models/holiday.js
const mongoose = require("mongoose");

const HolidaySchema = new mongoose.Schema({
  date: { type: String, required: true }, // format: MM-DD
  name: { type: String, required: true }, // eg. "Christmas"
  category: { type: String, required: true }, // eg. "christmas"
  theme: {
    background: String,
    accent: String,
    emoji: [String],
  },
});

module.exports =
  mongoose.models.Holiday || mongoose.model("Holiday", HolidaySchema);
