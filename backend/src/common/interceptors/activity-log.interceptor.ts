import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Activity Log Interceptor (Skeleton)
 * 
 * This is a skeleton for an activity logging interceptor.
 * Implement this to log user actions, API calls, and system events.
 * 
 * TODO: Implement activity logging based on your requirements:
 * 1. Create an ActivityLog entity/schema
 * 2. Create an ActivityLogService
 * 3. Implement the logging logic in this interceptor
 * 4. Add decorators to mark which endpoints should be logged
 * 
 * Usage:
 * ```typescript
 * import { APP_INTERCEPTOR } from '@nestjs/core';
 * 
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_INTERCEPTOR,
 *       useClass: ActivityLogInterceptor,
 *     },
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
    constructor(
        // TODO: Inject your ActivityLogService
        // private readonly activityLogService: ActivityLogService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();

        // TODO: Extract user information from request
        // const user = request.user;
        // const userId = user?.id;
        // const userEmail = user?.email;

        // TODO: Extract request information
        // const endpoint = request.url;
        // const method = request.method;
        // const ipAddress = request.ip;
        // const userAgent = request.headers['user-agent'];

        return next.handle().pipe(
            // TODO: Log successful requests
            // tap((data) => {
            //     const executionTime = Date.now() - startTime;
            //     this.activityLogService.logActivity({
            //         userId,
            //         userEmail,
            //         endpoint,
            //         method,
            //         ipAddress,
            //         userAgent,
            //         status: 'SUCCESS',
            //         executionTime,
            //     });
            // }),
            // TODO: Log failed requests
            // catchError((error) => {
            //     const executionTime = Date.now() - startTime;
            //     this.activityLogService.logActivity({
            //         userId,
            //         userEmail,
            //         endpoint,
            //         method,
            //         ipAddress,
            //         userAgent,
            //         status: 'FAILURE',
            //         errorMessage: error.message,
            //         executionTime,
            //     });
            //     throw error;
            // }),
        );
    }
}

