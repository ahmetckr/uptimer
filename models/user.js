const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    userID: {
        type: String
    },

    lang: {
        type: String
    },

    premium: {
        type: [Boolean, Date]
    }
});

module.exports = mongoose.model("user", userSchema)