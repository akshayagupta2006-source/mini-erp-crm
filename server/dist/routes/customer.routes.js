"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.route('/')
    .get(customer_controller_1.getCustomers)
    .post((0, auth_1.authorize)('ADMIN', 'SALES'), customer_controller_1.createCustomer);
router.route('/:id')
    .get(customer_controller_1.getCustomer)
    .put((0, auth_1.authorize)('ADMIN', 'SALES'), customer_controller_1.updateCustomer)
    .delete((0, auth_1.authorize)('ADMIN'), customer_controller_1.deleteCustomer);
router.route('/:id/followups')
    .get(customer_controller_1.getFollowUps)
    .post((0, auth_1.authorize)('ADMIN', 'SALES'), customer_controller_1.addFollowUp);
exports.default = router;
