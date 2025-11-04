import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap(() => {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('es-ES');
        const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        let message = '';
        if (url.includes('/login')) {
          message = `user logeado ${formattedDate} a las ${formattedTime}`;
        } else if (url.includes('/logout')) {
          message = `user deslogueado ${formattedDate} a las ${formattedTime}`;
        } else {
          message = `completed in ${Date.now() - now}ms`;
        }
        console.log(`[${method}] ${url} - ${message}`);
      }),
    );
  }
}
