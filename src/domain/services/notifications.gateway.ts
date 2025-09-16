import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  path: "/ws/notifications",
  cors: { origin: "*", credentials: false },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    // ✅ validate JWT if needed, extract userId
    console.log(`Client connected`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected`);
  }

  @SubscribeMessage("join")
  handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    console.log(`User ${userId} joined room`);
    client.join(userId);
  }

  // Example for read receipts
  @SubscribeMessage("markAsRead")
  handleMarkAsRead(
    @MessageBody() data: { id: string },
    @ConnectedSocket() client: Socket
  ) {
    console.log(`Notification ${data.id} marked as read.`);
  }

  // 🔥 method you call from NotificationService when you want to emit
  sendNotification(userId: string, payload: any) {
    // Option 1: If you have rooms per user
    this.server.to(userId).emit("notification", payload);

    // Option 2: If you don’t use rooms yet
    this.server.emit("notification", payload); // broadcast to everyone

    this.server.emit("notification", payload); // send to all
  }
}
