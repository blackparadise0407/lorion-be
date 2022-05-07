import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, call$: CallHandler<any>): Observable<any> {
    return call$.handle().pipe(map((data) => instanceToPlain(data)));
  }
}
