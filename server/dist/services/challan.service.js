"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallanService = void 0;
const db_1 = __importDefault(require("../config/db"));
const errorResponse_1 = require("../utils/errorResponse");
class ChallanService {
    static async createDraftChallan(customerId, items, userId) {
        // Check if customer exists
        const customer = await db_1.default.customer.findUnique({ where: { id: customerId } });
        if (!customer)
            throw new errorResponse_1.ErrorResponse('Customer not found', 404);
        // Fetch products to capture snapshots
        const productIds = items.map(i => i.productId);
        const products = await db_1.default.product.findMany({ where: { id: { in: productIds } } });
        if (products.length !== productIds.length) {
            throw new errorResponse_1.ErrorResponse('One or more products not found', 400);
        }
        const totalQuantity = items.reduce((acc, curr) => acc + curr.quantity, 0);
        // Generate Challan Number (e.g. CH-2026-0001)
        const year = new Date().getFullYear();
        const count = await db_1.default.challan.count({ where: { challanNumber: { startsWith: `CH-${year}` } } });
        const challanNumber = `CH-${year}-${String(count + 1).padStart(4, '0')}`;
        const challan = await db_1.default.challan.create({
            data: {
                challanNumber,
                customerId,
                totalQuantity,
                status: 'DRAFT',
                createdBy: userId,
                items: {
                    create: items.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        return {
                            productId: product.id,
                            quantity: item.quantity,
                            productNameSnapshot: product.name,
                            skuSnapshot: product.sku,
                            unitPriceSnapshot: product.unitPrice
                        };
                    })
                }
            },
            include: { items: true }
        });
        return challan;
    }
    static async confirmChallan(challanId, userId) {
        const result = await db_1.default.$transaction(async (tx) => {
            const challan = await tx.challan.findUnique({
                where: { id: challanId },
                include: { items: true }
            });
            if (!challan)
                throw new errorResponse_1.ErrorResponse('Challan not found', 404);
            if (challan.status !== 'DRAFT')
                throw new errorResponse_1.ErrorResponse(`Cannot confirm challan with status ${challan.status}`, 400);
            // Validate all products have enough stock
            for (const item of challan.items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product)
                    throw new errorResponse_1.ErrorResponse(`Product with ID ${item.productId} not found`, 404);
                if (product.currentStock < item.quantity) {
                    throw new errorResponse_1.ErrorResponse(`Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`, 400);
                }
                // Reduce stock
                await tx.product.update({
                    where: { id: product.id },
                    data: { currentStock: product.currentStock - item.quantity }
                });
                // Create OUT stock movement
                await tx.stockMovement.create({
                    data: {
                        productId: product.id,
                        quantity: item.quantity,
                        movementType: 'OUT',
                        reason: `Challan ${challan.challanNumber}`,
                        createdBy: userId
                    }
                });
            }
            // Mark challan as CONFIRMED
            const confirmedChallan = await tx.challan.update({
                where: { id: challanId },
                data: { status: 'CONFIRMED' },
                include: { items: true }
            });
            return confirmedChallan;
        });
        return result;
    }
    static async cancelChallan(challanId, userId) {
        const result = await db_1.default.$transaction(async (tx) => {
            const challan = await tx.challan.findUnique({
                where: { id: challanId },
                include: { items: true }
            });
            if (!challan)
                throw new errorResponse_1.ErrorResponse('Challan not found', 404);
            if (challan.status === 'CANCELLED')
                throw new errorResponse_1.ErrorResponse('Challan is already cancelled', 400);
            if (challan.status === 'CONFIRMED') {
                // Reverse the inventory
                for (const item of challan.items) {
                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    if (product) {
                        await tx.product.update({
                            where: { id: product.id },
                            data: { currentStock: product.currentStock + item.quantity }
                        });
                        await tx.stockMovement.create({
                            data: {
                                productId: product.id,
                                quantity: item.quantity,
                                movementType: 'IN',
                                reason: `Challan Cancellation ${challan.challanNumber}`,
                                createdBy: userId
                            }
                        });
                    }
                }
            }
            const cancelledChallan = await tx.challan.update({
                where: { id: challanId },
                data: { status: 'CANCELLED' }
            });
            return cancelledChallan;
        });
        return result;
    }
}
exports.ChallanService = ChallanService;
