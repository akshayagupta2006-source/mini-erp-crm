"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../config/db"));
const jwt_1 = require("../utils/jwt");
const errorResponse_1 = require("../utils/errorResponse");
const auth_validator_1 = require("../validators/auth.validator");
const login = async (req, res, next) => {
    try {
        const parsed = auth_validator_1.loginSchema.parse(req.body);
        const { email, password } = parsed;
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return next(new errorResponse_1.ErrorResponse('Invalid credentials', 401));
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return next(new errorResponse_1.ErrorResponse('Invalid credentials', 401));
        }
        const token = (0, jwt_1.generateToken)(user.id, user.role);
        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
