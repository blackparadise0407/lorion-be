import { IsDefined, IsString } from 'class-validator';

export class CreateConversationRequestDTO {
  @IsDefined()
  @IsString({ each: true })
  users: Array<string>;
}
