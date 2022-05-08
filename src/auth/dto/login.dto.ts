import { IsDefined } from 'class-validator';

export class LoginDTO {
  @IsDefined()
  readonly username: string;

  @IsDefined()
  readonly password: string;
}
