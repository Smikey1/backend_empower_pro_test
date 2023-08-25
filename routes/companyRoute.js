const router = require('express').Router();
const companyController = require('../controllers/companyController.js')
const auth = require('../middleware/auth.js')

router.post("/", auth.verifyUser, companyController.add_company)

router.get("/:id", auth.verifyUser, companyController.get_company_details)

router.patch("/cover-image/:id", auth.verifyUser, companyController.update_company_cover_image)

router.patch("/company-image/:id", auth.verifyUser, companyController.update_company_image)

router.patch("/no-image/:id", auth.verifyUser, companyController.edit_company_without_image)

router.delete("/:id", auth.verifyUser, companyController.delete_company)

module.exports = router