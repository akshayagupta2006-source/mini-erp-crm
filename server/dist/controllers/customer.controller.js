"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowUps = exports.addFollowUp = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomer = exports.getCustomers = void 0;
const db_1 = __importDefault(require("../config/db"));
const errorResponse_1 = require("../utils/errorResponse");
const customer_validator_1 = require("../validators/customer.validator");
const getCustomers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const status = req.query.status;
        const customerType = req.query.customerType;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { customerName: { contains: search, mode: 'insensitive' } },
                { mobile: { contains: search } },
                { businessName: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        if (customerType)
            where.customerType = customerType;
        const [customers, total] = await Promise.all([
            db_1.default.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            }),
            db_1.default.customer.count({ where })
        ]);
        res.status(200).json({
            success: true,
            data: customers,
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
exports.getCustomers = getCustomers;
const getCustomer = async (req, res, next) => {
    try {
        const customer = await db_1.default.customer.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                user: { select: { name: true } },
                followUps: {
                    orderBy: { followUpDate: 'desc' },
                    include: { user: { select: { name: true } } }
                }
            }
        });
        if (!customer) {
            return next(new errorResponse_1.ErrorResponse('Customer not found', 404));
        }
        res.status(200).json({
            success: true,
            data: customer
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomer = getCustomer;
const createCustomer = async (req, res, next) => {
    try {
        const parsed = customer_validator_1.createCustomerSchema.parse(req.body);
        const customer = await db_1.default.customer.create({
            data: {
                ...parsed,
                createdBy: req.user.id
            }
        });
        res.status(201).json({
            success: true,
            data: customer
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res, next) => {
    try {
        const parsed = customer_validator_1.updateCustomerSchema.parse(req.body);
        let customer = await db_1.default.customer.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!customer) {
            return next(new errorResponse_1.ErrorResponse('Customer not found', 404));
        }
        customer = await db_1.default.customer.update({
            where: { id: parseInt(req.params.id) },
            data: parsed
        });
        res.status(200).json({
            success: true,
            data: customer
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res, next) => {
    try {
        const customer = await db_1.default.customer.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!customer) {
            return next(new errorResponse_1.ErrorResponse('Customer not found', 404));
        }
        await db_1.default.customer.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCustomer = deleteCustomer;
const addFollowUp = async (req, res, next) => {
    try {
        const customerId = parseInt(req.params.id);
        const parsed = customer_validator_1.followUpSchema.parse(req.body);
        const customer = await db_1.default.customer.findUnique({ where: { id: customerId } });
        if (!customer) {
            return next(new errorResponse_1.ErrorResponse('Customer not found', 404));
        }
        const followUpDate = parsed.followUpDate ? new Date(parsed.followUpDate) : new Date();
        const followUp = await db_1.default.customerFollowUp.create({
            data: {
                customerId,
                note: parsed.note,
                followUpDate,
                createdBy: req.user.id
            }
        });
        // Optionally update customer's last follow up date
        await db_1.default.customer.update({
            where: { id: customerId },
            data: { followUpDate }
        });
        res.status(201).json({
            success: true,
            data: followUp
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addFollowUp = addFollowUp;
const getFollowUps = async (req, res, next) => {
    try {
        const customerId = parseInt(req.params.id);
        const followUps = await db_1.default.customerFollowUp.findMany({
            where: { customerId },
            orderBy: { followUpDate: 'desc' },
            include: { user: { select: { name: true } } }
        });
        res.status(200).json({
            success: true,
            data: followUps
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFollowUps = getFollowUps;
