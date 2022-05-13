import { ArrayNotEmpty, IsDefined, IsString } from 'class-validator';

export class CreateConversationRequestDTO {
  @IsDefined()
  @ArrayNotEmpty()
  @IsString({ each: true })
  users: Array<string>;

  name: string;
}
