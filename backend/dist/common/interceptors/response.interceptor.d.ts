import { HttpException } from '@nestjs/common';
export declare const successResponse: (message: string, data?: any) => {
    success: boolean;
    message: string;
    data: any;
    timestamp: string;
};
export declare const failureResponse: (error: any) => HttpException;
