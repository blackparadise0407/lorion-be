import { IsDefined } from 'class-validator';

export class ResendVerificationEmailDTO {
  @IsDefined()
  username?: string;
}
