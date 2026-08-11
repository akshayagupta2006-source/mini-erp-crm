"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const errorResponse_1 = require("../utils/errorResponse");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new errorResponse_1.ErrorResponse('Not authorized to access this route', 401));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await db_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return next(new errorResponse_1.ErrorResponse('No user found with this id', 404));
        }
        req.user = user;
        next();
    }
    catch (err) {
        return next(new errorResponse_1.ErrorResponse('Not authorized to access this route', 401));
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new errorResponse_1.ErrorResponse(`User role ${req.user?.role} is not authorized to access this route`, 403));
        }
        next();
    };
};
exports.authorize = authorize;
