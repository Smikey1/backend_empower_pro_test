const Company = require("../models/Company")
// const Review = require("../models/Review")
const { success, failure } = require("../utils/message.js")
const cloudinary = require('../utils/cloudinary.js')

module.exports.add_company = async function (req, res) {
    try {
        const userId = req.user._id
        if (req.files !== undefined) {
            const formImage = req.files.image
            const imagePath = formImage.tempFilePath
            if (formImage.mimetype == "image/png" || formImage.mimetype == "image/jpg" || formImage.mimetype == "image/jpeg") {
                const image = await cloudinary.upload_image(imagePath, userId)
                const company = new Company({
                    user: userId,
                    name: req.body.name,
                    description: req.body.description,
                    phone: req.body.phone,
                    openingTime: req.body.openingTime,
                    closingTime: req.body.closingTime,
                    address: req.body.address,
                    image: image
                })
                const savedCompany = await company.save()
                res.json(success("New Company with Image Added", savedCompany))
            }
            else {
                res.json(failure("Must be png, jpg or jpeg"))
            }
        }
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.update_company_cover_image = async function (req, res) {
    try {
        const formImage = req.files.image
        const imagePath = formImage.tempFilePath
        if (formImage.mimetype == "image/png" || formImage.mimetype == "image/jpg" || formImage.mimetype == "image/jpeg") {
            const _id = req.params.id
            const coverImage = await cloudinary.upload_image(imagePath, _id)
            await Company.updateOne({ _id }, { coverImage })
            res.json(success("Company Cover Image Changed"))
        }
        else {
            res.json(failure("Must be png, jpg or jpeg"))
        }
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}
module.exports.edit_company_without_image = async function (req, res) {
    try {
        await Company.findOneAndUpdate({
            _id: req.params.id
        }, {
            name: req.body.name,
            description: req.body.description,
            phone: req.body.phone,
            openingTime: req.body.openingTime,
            closingTime: req.body.closingTime,
            address: req.body.address
        })
        res.json(success("Updated Company Details without image"))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}
module.exports.update_company_image = async function (req, res) {
    try {
        const formImage = req.files.image
        const imagePath = formImage.tempFilePath
        if (formImage.mimetype == "image/png" || formImage.mimetype == "image/jpg" || formImage.mimetype == "image/jpeg") {
            const _id = req.params.id
            const image = await cloudinary.upload_image(imagePath, _id)
            await Company.updateOne({ _id }, { image })
            res.json(success("Company Image Changed"))
        }
        else {
            res.json(failure("Must be png, jpg or jpeg"))
        }
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}
module.exports.get_company_details = async function (req, res) {
    try {
        const user = req.user
        const companyId = req.params.id
        let company = await Company.findById(companyId)
        if (company) {
            const data = company.toObject()
            // data["review"] = await Review.find({ company: companyId }).populate("user")
            res.json(success("Company Found", data))
        }
        else {
            res.json(failure("Company not found"))
        }
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

module.exports.delete_company = async function (req, res) {
    try {
        await Company.deleteOne({ _id: req.params.id, user: req.user._id })
        res.json(success("Company Deleted"))
    }
    catch (e) {
        console.log(e)
        res.json(failure())
    }
    res.end()
}