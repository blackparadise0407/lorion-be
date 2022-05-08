import { User } from '@/user/user.schema';

export class SendVerificationEmailDTO {
  readonly user: User;
  readonly token: string;
}
