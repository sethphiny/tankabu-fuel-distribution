"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failureResponse = exports.successResponse = void 0;
const common_1 = require("@nestjs/common");
const successResponse = (message, data) => {
    return {
        success: true,
        message,
        data: data || null,
        timestamp: new Date().toISOString(),
    };
};
exports.successResponse = successResponse;
const failureResponse = (error) => {
    if (error instanceof common_1.HttpException) {
        return error;
    }
    const message = error?.message || 'An unexpected error occurred';
    const status = error?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    return new common_1.HttpException({
        success: false,
        message,
        timestamp: new Date().toISOString(),
    }, status);
};
exports.failureResponse = failureResponse;
//# sourceMappingURL=response.interceptor.js.map