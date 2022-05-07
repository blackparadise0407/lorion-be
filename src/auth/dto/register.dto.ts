import { IsDefined, IsEmail, Matches } from 'class-validator';

export class RegisterDTO {
  @IsDefined()
  readonly username: string;

  @IsDefined()
  @IsEmail({
    message: 'Invalid email format',
  })
  readonly email: string;

  @IsDefined()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must have minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  readonly password: string;
}
