import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OrderType } from './entities/order.entity';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'delivery' })
export class OrderGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OrderGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('Delivery WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Delivery client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Delivery client disconnected: ${client.id}`);
  }

  emitNewDelivery(order: OrderType) {
    this.server.emit('delivery:new', order);
  }

  emitDeliveryDone(orderId: string) {
    this.server.emit('delivery:done', { id: orderId });
  }
}
