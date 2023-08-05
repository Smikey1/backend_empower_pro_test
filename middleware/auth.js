const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { failure } = require("../utils/message.js");

module.exports.verifyUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.body.headers.Authorization;
        const accessToken = authHeader && authHeader.split(" ")[1];
        // If there are no token, unauthorized
        if (accessToken == null) return res.json(failure("Unauthorized"));
        const authUser = jwt.verify(accessToken, process.env.TOKEN_KEY);
        const issuedAt = new Date(authUser.iat * 1000);
        const user = await User.findOne({
            _id: authUser._id
        }).select("+passwordSetDate");
        passwordSetDate = new Date(user.passwordSetDate);
        if (user) {
            if (issuedAt >= passwordSetDate) {
                req.user = user;
                next();
            }
            else {
                // Password Changed
                res.json(failure("Unauthorized"));
            }
        } else {
            res.json(failure("Unauthorized"));
        }
    } catch (err) {
        console.log(err);
        res.json(failure());
    }
}
