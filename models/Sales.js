const mongoose = require('mongoose');
const saleSchema = mongoose.Schema({
    saleName: {
        type: String,
        default: "",
        get: capitalize
    },
    saleID: {
        type: String,
        default: "",
    },
    saleValue_month: {
        type: String,
        default: ""
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { toJSON: { getters: true } })

function capitalize(name) {
    return name.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
}

module.exports = mongoose.model("Sale", saleSchema);