"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followUpSchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1, 'Customer name is required'),
    mobile: zod_1.z.string().min(1, 'Mobile number is required'),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    businessName: zod_1.z.string().optional().or(zod_1.z.literal('')),
    gstNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
    customerType: zod_1.z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).optional(),
    address: zod_1.z.string().optional().or(zod_1.z.literal('')),
    status: zod_1.z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
    notes: zod_1.z.string().optional().or(zod_1.z.literal('')),
});
exports.updateCustomerSchema = exports.createCustomerSchema.partial();
exports.followUpSchema = zod_1.z.object({
    note: zod_1.z.string().min(1, 'Note is required'),
    followUpDate: zod_1.z.string().datetime().optional()
});
