// notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  // Let clients join their personal room
  @SubscribeMessage("join")
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    client.join(userId); // user joins a room with their ID
    console.log(`User ${userId} joined room`);
  }

  // Send notification to a specific user
  sendNotification(userId: string, notification: any) {
    this.server.to(userId).emit("notification", notification);
    console.log(`Notification sent to user ${userId}`);
  }
}
