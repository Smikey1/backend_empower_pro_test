const router = require('express').Router();
const auth = require("../middleware/auth.js");
const userController = require('../controllers/userController.js');

router.post("/register", userController.register_new_user);

router.post("/login", userController.login_user);

router.get("/", auth.verifyUser, userController.get_user_detail);

router.patch("/password", auth.verifyUser, userController.change_password)

router.patch("/", auth.verifyUser, userController.update_user_detail);

router.patch("/email-phone", auth.verifyUser, userController.update_user_email_phone);

router.patch("/device", auth.verifyUser, userController.update_user_device);

router.patch("/profile", auth.verifyUser, userController.update_profile_picture)

router.post("/reset-user-code-for-password", userController.user_reset_code_reset_password)

router.post("/reset-user-code-for-email-phone", auth.verifyUser, userController.reset_code_for_email_phone)

router.patch("/new-password", userController.set_new_password)

router.post("/validate-email", userController.validate_email)

module.exports = router;