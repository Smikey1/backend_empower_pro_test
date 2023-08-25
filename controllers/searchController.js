const Job = require("../models/Job")
const User= require("../models/User")
const {success, failure} = require("../utils/message.js")

exports.search_user_and_job = async function(req,res){
    try {
        const pattern = req.body.pattern
        if(pattern[0]=="#"){
            const tag = pattern.substring(1,pattern.length)
            const jobList = await Job.find({hashtag: {$in: [tag]}, isPosted: true })
            const data= {
                user: [],
                job: jobList
            }
            res.json(success("Fetch users and job", data))
        }
        else{
            const userList = await User.find({fullname: {$regex: pattern}})
            const jobList = await Job.find({title: {$regex: pattern}, isPosted: true })
            const data= {
                user: userList,
                job: jobList
            }
            res.json(success("Fetch users and job", data))
        }
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}
