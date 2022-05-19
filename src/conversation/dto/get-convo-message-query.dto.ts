import { IsNumber } from 'class-validator';

export class GetConversationMessageQueryDTO {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;
}
