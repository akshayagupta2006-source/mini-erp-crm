"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelChallan = exports.confirmChallan = exports.createChallan = exports.getChallan = exports.getChallans = void 0;
const db_1 = __importDefault(require("../config/db"));
const challan_service_1 = require("../services/challan.service");
const challan_validator_1 = require("../validators/challan.validator");
const errorResponse_1 = require("../utils/errorResponse");
const getChallans = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [challans, total] = await Promise.all([
            db_1.default.challan.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { customerName: true, businessName: true } },
                    user: { select: { name: true } }
                }
            }),
            db_1.default.challan.count({ where })
        ]);
        res.status(200).json({
            success: true,
            data: challans,
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
exports.getChallans = getChallans;
const getChallan = async (req, res, next) => {
    try {
        const challan = await db_1.default.challan.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                customer: true,
                items: true,
                user: { select: { name: true } }
            }
        });
        if (!challan) {
            return next(new errorResponse_1.ErrorResponse('Challan not found', 404));
        }
        res.status(200).json({
            success: true,
            data: challan
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getChallan = getChallan;
const createChallan = async (req, res, next) => {
    try {
        const parsed = challan_validator_1.createChallanSchema.parse(req.body);
        const challan = await challan_service_1.ChallanService.createDraftChallan(parsed.customerId, parsed.items, req.user.id);
        res.status(201).json({
            success: true,
            data: challan
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createChallan = createChallan;
const confirmChallan = async (req, res, next) => {
    try {
        const challan = await challan_service_1.ChallanService.confirmChallan(parseInt(req.params.id), req.user.id);
        res.status(200).json({
            success: true,
            data: challan
        });
    }
    catch (error) {
        next(error);
    }
};
exports.confirmChallan = confirmChallan;
const cancelChallan = async (req, res, next) => {
    try {
        const challan = await challan_service_1.ChallanService.cancelChallan(parseInt(req.params.id), req.user.id);
        res.status(200).json({
            success: true,
            data: challan
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelChallan = cancelChallan;
