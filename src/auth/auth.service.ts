import { Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {
  public async compareHash(s: string, h: string) {
    return await bcryptjs.compare(s, h);
  }
}
