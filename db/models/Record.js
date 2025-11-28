const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true },
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Record", recordSchema);

