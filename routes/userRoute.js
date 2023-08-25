const router = require('express').Router();
const auth = require("../middleware/auth.js");
const userController = require('../controllers/userController.js');

router.post("/register", userController.register_new_user);

router.post("/login", userController.login_user);

router.post("/savedJob/:jobId", auth.verifyUser, userController.single_saved_job)

router.post("/appliedJob/:jobId", auth.verifyUser, userController.single_applied_job)

router.get("/", auth.verifyUser, userController.get_user_detail);

router.get("/post", auth.verifyUser, userController.get_user_post);

router.get("/job", auth.verifyUser, userController.get_user_job);

router.get("/savedJob", auth.verifyUser, userController.get_all_user_saved_job);

router.get("/appliedJob", auth.verifyUser, userController.get_all_user_applied_job);

router.post("/resend-login-otp", auth.verifyUser, userController.resend_login_otp)

router.post("/resend-otp", auth.verifyUser, userController.resend_otp)

router.patch("/password", auth.verifyUser, userController.change_password)

router.patch("/", auth.verifyUser, userController.update_user_detail);

router.patch("/email-phone", auth.verifyUser, userController.update_user_email_phone);

router.patch("/device", auth.verifyUser, userController.update_user_device);

router.patch("/profile", auth.verifyUser, userController.update_profile_picture)

router.patch("/follow/:id", auth.verifyUser, userController.follow_user)

router.get("/followers", auth.verifyUser, userController.get_user_followers)

router.get("/following", auth.verifyUser, userController.get_user_following)

router.get("/:id", auth.verifyUser, userController.view_other_profile)

router.post("/reset-user-code-for-password", userController.user_reset_code_reset_password)

router.post("/reset-user-code-for-email-phone", auth.verifyUser, userController.reset_code_for_email_phone)

router.patch("/new-password", userController.set_new_password)

router.post("/validate-email", userController.validate_email)

module.exports = router;