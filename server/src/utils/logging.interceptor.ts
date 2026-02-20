import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.originalUrl || req.url;
    console.log('---\n🌐 Nueva petición entrante:', method, url);
    if (req.headers) {
      console.log('Headers:', req.headers);
    }
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      console.log('Body:', req.body);
    }
    return next.handle();
  }
}
