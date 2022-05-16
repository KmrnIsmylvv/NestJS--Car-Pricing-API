import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class SerializeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    handler: CallHandler<any>,
  ): Observable<any> {
    console.log('Im running before the handler', context);

    return handler.handle().pipe(
      map((data: any) => {
        console.log('Iam running before response is sent out', data);
      }),
    );
  }
}
