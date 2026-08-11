"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challan_controller_1 = require("../controllers/challan.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.route('/')
    .get(challan_controller_1.getChallans)
    .post((0, auth_1.authorize)('ADMIN', 'SALES'), challan_controller_1.createChallan);
router.route('/:id')
    .get(challan_controller_1.getChallan);
router.route('/:id/confirm')
    .post((0, auth_1.authorize)('ADMIN', 'SALES'), challan_controller_1.confirmChallan);
router.route('/:id/cancel')
    .post((0, auth_1.authorize)('ADMIN', 'SALES'), challan_controller_1.cancelChallan);
exports.default = router;
