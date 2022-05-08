import { JwtPayload } from 'jsonwebtoken';

import { User } from '@/user/user.schema';

export type Payload = JwtPayload & Partial<User>;
