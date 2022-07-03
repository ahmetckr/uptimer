const mongoose = require("mongoose");

const link = new mongoose.Schema({

    userID: {
        type: String
    },

    url: {
        type: String
    },

    date: {
        type: Date
    },

    totalHost: {
        type: Number
    },

    lastHost: {
        type: Date
    },

    lastPing: {
        type: Number
    }
});

module.exports = mongoose.model("url", link)