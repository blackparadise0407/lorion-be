export class MessagePayloadDTO {
  conversationId: string;
  message: string;
  timestamp: number;
  senderId: string;
  receivers: Array<string>;
}
