"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorResponse_1 = require("../utils/errorResponse");
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Prisma unique constraint error
    if (err.code === 'P2002') {
        const message = `Duplicate field value entered`;
        error = new errorResponse_1.ErrorResponse(message, 400);
    }
    // Validation Error
    if (err.name === 'ZodError') {
        const message = err.errors.map((e) => e.message).join(', ');
        error = new errorResponse_1.ErrorResponse(message, 400);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};
exports.errorHandler = errorHandler;
