"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
// Custom Middlewares
const _middlewares_1 = require("@middlewares");
const auth_middleware_1 = require("@models/auth/auth-middleware");
// Routes
const user_routes_1 = __importDefault(require("@models/user/user-routes"));
const auth_routes_1 = __importDefault(require("@models/auth/auth-routes"));
const shelter_routes_1 = __importDefault(require("@models/shelter/shelter-routes"));
const pet_routes_1 = __importDefault(require("@models/pet/pet-routes"));
const app_error_1 = __importDefault(require("@utils/app-error"));
const app = (0, express_1.default)();
const BASE_ROUTE = process.env.BASE_ROUTE || '/api/v1';
// Express middlewares
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(_middlewares_1.corsMiddleware);
app.use((0, morgan_1.default)('dev'));
app.use((0, _middlewares_1.rateLimiter)(100, 15 * 60 * 1000)); // Limit to 100 requests per 15 minutes
app.use('/uploads', express_1.default.static('uploads'));
// Test Route: Entry POINT
app.get('/api/v1/', auth_middleware_1.verifyTokenMiddleware, (req, res) => {
    res.json({
        message: 'hello',
    });
});
app.use(`${BASE_ROUTE}/users`, user_routes_1.default);
app.use(`${BASE_ROUTE}/auth`, auth_routes_1.default);
app.use(`${BASE_ROUTE}/shelters`, shelter_routes_1.default);
app.use(`${BASE_ROUTE}/pets`, pet_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof app_error_1.default) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
});
exports.default = app;
