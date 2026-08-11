"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockHistory = exports.addStockMovement = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const db_1 = __importDefault(require("../config/db"));
const errorResponse_1 = require("../utils/errorResponse");
const product_validator_1 = require("../validators/product.validator");
const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [products, total] = await Promise.all([
            db_1.default.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            db_1.default.product.count({ where })
        ]);
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res, next) => {
    try {
        const product = await db_1.default.product.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!product) {
            return next(new errorResponse_1.ErrorResponse('Product not found', 404));
        }
        res.status(200).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res, next) => {
    try {
        const parsed = product_validator_1.createProductSchema.parse(req.body);
        const exists = await db_1.default.product.findUnique({ where: { sku: parsed.sku } });
        if (exists) {
            return next(new errorResponse_1.ErrorResponse('Product with this SKU already exists', 409));
        }
        const product = await db_1.default.product.create({
            data: {
                ...parsed,
                currentStock: 0 // New products start at 0
            }
        });
        res.status(201).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const parsed = product_validator_1.updateProductSchema.parse(req.body);
        let product = await db_1.default.product.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!product) {
            return next(new errorResponse_1.ErrorResponse('Product not found', 404));
        }
        if (parsed.sku && parsed.sku !== product.sku) {
            const exists = await db_1.default.product.findUnique({ where: { sku: parsed.sku } });
            if (exists) {
                return next(new errorResponse_1.ErrorResponse('Product with this SKU already exists', 409));
            }
        }
        product = await db_1.default.product.update({
            where: { id: parseInt(req.params.id) },
            data: parsed
        });
        res.status(200).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const product = await db_1.default.product.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!product) {
            return next(new errorResponse_1.ErrorResponse('Product not found', 404));
        }
        await db_1.default.product.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const addStockMovement = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        const parsed = product_validator_1.stockMovementSchema.parse(req.body);
        const { quantity, movementType, reason } = parsed;
        const product = await db_1.default.product.findUnique({ where: { id: productId } });
        if (!product) {
            return next(new errorResponse_1.ErrorResponse('Product not found', 404));
        }
        // Using transaction for atomic update
        const result = await db_1.default.$transaction(async (tx) => {
            if (movementType === 'OUT' && product.currentStock < quantity) {
                throw new errorResponse_1.ErrorResponse(`Insufficient stock for ${product.name}`, 400);
            }
            const newStock = movementType === 'IN'
                ? product.currentStock + quantity
                : product.currentStock - quantity;
            const movement = await tx.stockMovement.create({
                data: {
                    productId,
                    quantity,
                    movementType,
                    reason,
                    createdBy: req.user.id
                }
            });
            const updatedProduct = await tx.product.update({
                where: { id: productId },
                data: { currentStock: newStock }
            });
            return { movement, product: updatedProduct };
        });
        res.status(201).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addStockMovement = addStockMovement;
const getStockHistory = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        const history = await db_1.default.stockMovement.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true } },
                product: { select: { name: true, sku: true } }
            }
        });
        res.status(200).json({
            success: true,
            data: history
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStockHistory = getStockHistory;
