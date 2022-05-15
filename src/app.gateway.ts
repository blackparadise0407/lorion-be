import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import { MessagePayloadDTO } from './dto/message-payload.dto';
import { Payload } from './token/jwt.payload';
import { TokenService } from './token/token.service';
import { UserService } from './user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}
  @WebSocketServer() private readonly server: Server;
  private logger = new Logger('AppGateway');
  private users: { [userId: string]: Payload & { socketId: string } } = {};

  public afterInit(): void {
    this.logger.log('Init gateway');
  }

  public handleConnection(client: Socket): void {
    const user = this.getPayloadFromClient(client);
    if (user) {
      this.users[user.sub] = { ...user, socketId: client.id };
      this.server.emit('online', user.sub);
    }
    this.logger.log('Client connected', client.id);
  }

  public handleDisconnect(client: Socket): void {
    const user = this.getPayloadFromClient(client);
    if (user) {
      delete this.users[user.sub];
    }
    this.logger.log('Client disconnected', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: MessagePayloadDTO): void {
    this.server.to(payload.conversationId).emit('message', payload);
  }

  private getPayloadFromClient(client: Socket) {
    const token = client.handshake?.query?.token;
    if (token !== 'null' && typeof token === 'string') {
      return this.tokenService.validateJwt(token, true);
    }
    return null;
  }

  @SubscribeMessage('join')
  handleJoinRoom(client: Socket, roomId: string): void {
    client.join(roomId);
    this.logger.log(`Client ${client.id} JOIN room ${roomId}`);
  }

  @SubscribeMessage('leave')
  handleLeaveRoom(client: Socket, roomId: string): void {
    client.leave(roomId);
    this.logger.log(`Client ${client.id} LEAVE room ${roomId}`);
  }
}
