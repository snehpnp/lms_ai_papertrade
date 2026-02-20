"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = require("./routes");
const errorHandler_1 = require("./middlewares/errorHandler");
const rateLimit_1 = require("./middlewares/rateLimit");
const config_1 = require("./config");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json({ limit: '1mb' }));
app.use('/api/v1/auth', rateLimit_1.authLimiter);
app.use(rateLimit_1.apiLimiter);
app.use(routes_1.routes);
app.use(errorHandler_1.errorHandler);
app.listen(config_1.config.port, () => {
    console.log(`TradeLearn Pro API running on port ${config_1.config.port} (${config_1.config.env})`);
});
//# sourceMappingURL=index.js.map