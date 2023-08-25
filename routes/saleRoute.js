const router = require('express').Router();
const auth = require("../middleware/auth.js");
const saleController = require('../controllers/saleController.js');

router.post("/add", auth.verifyUser, saleController.add_new_sale);

router.get("/", auth.verifyUser, saleController.get_all_sale);

router.get("/single/:id", auth.verifyUser, saleController.get_single_sale)


module.exports = router;