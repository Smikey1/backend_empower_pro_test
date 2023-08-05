const router = require('express').Router();
const auth = require("../middleware/auth.js");
const userController = require('../controllers/userController.js');

router.post("/register", userController.register_new_user);

router.post("/login", userController.login_user);

router.get("/", auth.verifyUser, userController.get_user_detail);

router.patch("/password", auth.verifyUser, userController.change_password)

router.patch("/", auth.verifyUser, userController.update_user_detail);

router.patch("/profile", auth.verifyUser, userController.update_profile_picture)

router.post("/reset", userController.reset_password)

router.patch("/new-password", userController.new_password)

router.post("/validate-email", userController.validate_email)

module.exports = router;