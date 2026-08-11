"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.route('/')
    .get(product_controller_1.getProducts)
    .post((0, auth_1.authorize)('ADMIN', 'WAREHOUSE'), product_controller_1.createProduct);
router.route('/:id')
    .get(product_controller_1.getProduct)
    .put((0, auth_1.authorize)('ADMIN', 'WAREHOUSE'), product_controller_1.updateProduct)
    .delete((0, auth_1.authorize)('ADMIN'), product_controller_1.deleteProduct);
router.route('/:id/stock')
    .post((0, auth_1.authorize)('ADMIN', 'WAREHOUSE'), product_controller_1.addStockMovement);
router.route('/:id/stock-history')
    .get(product_controller_1.getStockHistory);
exports.default = router;
