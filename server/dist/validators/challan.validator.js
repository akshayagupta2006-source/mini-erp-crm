"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChallanSchema = void 0;
const zod_1 = require("zod");
exports.createChallanSchema = zod_1.z.object({
    customerId: zod_1.z.number().positive(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.number().positive(),
        quantity: zod_1.z.number().positive('Quantity must be positive')
    })).min(1, 'At least one item is required')
});
