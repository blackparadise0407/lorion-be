import { IsDefined } from 'class-validator';

export class TokenRequestDTO {
  @IsDefined()
  refreshToken: string;
}
