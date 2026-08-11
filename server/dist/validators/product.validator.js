"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockMovementSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Product name is required'),
    sku: zod_1.z.string().min(1, 'SKU is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    unitPrice: zod_1.z.number().min(0, 'Unit price cannot be negative'),
    minimumStock: zod_1.z.number().min(0, 'Minimum stock cannot be negative').default(0),
    warehouse: zod_1.z.string().min(1, 'Warehouse location is required')
});
exports.updateProductSchema = exports.createProductSchema.partial();
exports.stockMovementSchema = zod_1.z.object({
    quantity: zod_1.z.number().positive('Quantity must be a positive number'),
    movementType: zod_1.z.enum(['IN', 'OUT']),
    reason: zod_1.z.string().min(1, 'Reason is required')
});
