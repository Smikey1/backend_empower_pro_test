const mongoose = require('mongoose');
const moment = require('moment')
const postSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    postType:{
        type:String,
        enum:['post','job', 'share'],
        default:"post"
    },
    relatedJob:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        default: null
    },
    image:{
        type:String,
        default:""
    },
    status:{
        type:String,
        default:""
    },
    createdDate:{
        type:Date,
        default: Date.now,
        get: dateConverter
    },
    updatedDate:{
        type:Date,
        default: Date.now,
    },
    archive:{
        type:Boolean,
        default: false,
    },
    systemArchive:{
        type:Boolean,
        default: false,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}, { toJSON: { getters: true } })

function dateConverter(date){
    return moment(date).fromNow()
}

module.exports = mongoose.model("Post",postSchema);