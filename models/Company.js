const mongoose = require('mongoose');

const companySchema = mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String
    },
    phone: {
        type: String
    },
    openingTime: {
        type: String,
    },
    closingTime: {
        type: String,
    },
    address: {
        type: String
    },
    image: {
        type: String,
        default: "",
    },
    coverImage: {
        type: String,
        default: "",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // review: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Review"
    // }
})

module.exports = mongoose.model("Company", companySchema);