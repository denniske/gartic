import {IChatRoom} from "./chat-room";

export class ChatRoomMock implements IChatRoom {
    public server: any;

    constructor(private broadcasts: any[], private messages: any[]) {

    }

    broadcast(message: any) {
        this.broadcasts.push(message);
    }

    close(sessionId: string, code: number, reason: string) {
        this.server.close(sessionId);
    }

    send(sessionId: string, message: any) {
        this.messages.push({sessionId, ...message});
    }
}
