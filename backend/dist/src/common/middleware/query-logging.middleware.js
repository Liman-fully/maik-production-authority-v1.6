"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryLoggingMiddleware = void 0;
const common_1 = require("@nestjs/common");
let QueryLoggingMiddleware = class QueryLoggingMiddleware {
    constructor() {
        this.SLOW_THRESHOLD_MS = 500;
    }
    use(req, res, next) {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            if (duration > this.SLOW_THRESHOLD_MS) {
                const query = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
                console.warn(`[SlowQuery] ${req.method} ${req.path}${query} - ${duration}ms`);
            }
        });
        next();
    }
};
exports.QueryLoggingMiddleware = QueryLoggingMiddleware;
exports.QueryLoggingMiddleware = QueryLoggingMiddleware = __decorate([
    (0, common_1.Injectable)()
], QueryLoggingMiddleware);
//# sourceMappingURL=query-logging.middleware.js.map