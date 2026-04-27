import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Response Utilities
 * 
 * Helper functions for standardizing API responses.
 * Use these in your controllers and services for consistent response formatting.
 * 
 * Usage:
 * ```typescript
 * import { successResponse, failureResponse } from '@/interceptors/response.interceptor';
 * 
 * @Get('users')
 * getUsers() {
 *   try {
 *     const users = await this.userService.findAll();
 *     return successResponse('Users retrieved successfully', users);
 *   } catch (error) {
 *     throw failureResponse(error);
 *   }
 * }
 * ```
 */

/**
 * Create a success response
 * 
 * @param message - Success message
 * @param data - Response data (optional)
 * @returns Standardized success response object
 */
export const successResponse = (message: string, data?: any) => {
  return {
    success: true,
    message,
    data: data || null,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Create a failure response (HttpException)
 * 
 * @param error - Error object or message
 * @returns HttpException with standardized error format
 */
export const failureResponse = (error: any): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  const message = error?.message || 'An unexpected error occurred';
  const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;

  return new HttpException(
    {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    },
    status,
  );
};

