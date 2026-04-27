import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const apiKey = this.configService.get<string>('BACKEND_API_KEY');
    
    if (!apiKey) {
      // If no API key is set, allow access but log a warning (matching original logic)
      console.warn("⚠️ BACKEND_API_KEY not set in .env. API is currently unprotected.");
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const incomingKey = request.headers['x-api-key'] || request.headers['authorization'];

    if (incomingKey === apiKey) {
      return true;
    }

    throw new UnauthorizedException('Invalid or missing API Key');
  }
}
