import LobbyServer from "../src/server/lobby-server";
import {IChatRoom} from "../src/chat-room";

class ChatRoomMock implements IChatRoom {
    broadcast(message: any) {
        broadcasts.push(message);
    }

    close(sessionId: string, code: number, reason: string) {
        lobbyServer.close(sessionId);
    }

    send(sessionId: string, message: any) {
        messages.push({sessionId, ...message});
    }
}


let broadcasts: any[] = [];
let messages: any[] = [];

let chatRoomMock = new ChatRoomMock();
let lobbyServer: LobbyServer;

describe('LobbyServer', () => {
    // Applies only to tests in this describe block
    beforeEach(() => {
        broadcasts = [];
        messages = [];
        lobbyServer = new LobbyServer(chatRoomMock);
    });

    test('join will broadcast new member', () => {
        const sessionId = 's1';
        lobbyServer.open(sessionId);
        lobbyServer.message(sessionId, {action: 'lobby-join', id: 'u1', name: 'Dennis'});

        console.log(broadcasts);
        console.log(messages);

        expect(broadcasts).toEqual([
            {
                action: 'lobby-member-join',
                member: expect.objectContaining({id: 'u1', name: 'Dennis'}),
            }
        ]);
    });

    test('join will send existing members', () => {
        const sessionId = 's1';
        lobbyServer.open(sessionId);
        lobbyServer.message(sessionId, {action: 'lobby-join', id: 'u1', name: 'Dennis'});

        expect(messages).toEqual([]);

        const sessionId2 = 's2';
        lobbyServer.open(sessionId2);
        lobbyServer.message(sessionId2, {action: 'lobby-join', id: 'u2', name: 'Dennis2'});

        console.log(broadcasts);
        console.log(messages);

        expect(messages).toEqual([
            {
                sessionId: 's2',
                action: 'lobby-member-join',
                member: expect.objectContaining({id: 'u1', name: 'Dennis'}),
            },
        ]);
    });

    test('kick will kick member', () => {
        const sessionId = 's1';
        lobbyServer.open(sessionId);
        lobbyServer.message(sessionId, {action: 'lobby-join', id: 'u1', name: 'Dennis'});
        const sessionId2 = 's2';
        lobbyServer.open(sessionId2);
        lobbyServer.message(sessionId2, {action: 'lobby-join', id: 'u2', name: 'Dennis2'});

        broadcasts = [];

        lobbyServer.message(sessionId, {action: 'lobby-kick', id: 'u2'});

        console.log(broadcasts);
        console.log(messages);

        expect(broadcasts).toEqual([
            {
                action: 'lobby-member-quit',
                id: 'u2'
            },
        ]);
    });

    test('first user becomes admin, further users won\'t become admin', () => {
        const sessionId = 's1';
        lobbyServer.open(sessionId);
        lobbyServer.message(sessionId, {action: 'lobby-join', id: 'u1', name: 'Dennis'});
        const sessionId2 = 's2';
        lobbyServer.open(sessionId2);
        lobbyServer.message(sessionId2, {action: 'lobby-join', id: 'u2', name: 'Dennis2'});

        console.log(broadcasts);
        console.log(messages);

        expect(broadcasts).toEqual([
            {
                action: 'lobby-member-join',
                member: {id: 'u1', name: 'Dennis', admin: true}
            },
            {
                action: 'lobby-member-join',
                member: {id: 'u2', name: 'Dennis2', admin: false}
            },
        ]);
    });

    test('determine new admin when admin leaves', () => {
        const sessionId = 's1';
        lobbyServer.open(sessionId);
        lobbyServer.message(sessionId, {action: 'lobby-join', id: 'u1', name: 'Dennis'});
        const sessionId2 = 's2';
        lobbyServer.open(sessionId2);
        lobbyServer.message(sessionId2, {action: 'lobby-join', id: 'u2', name: 'Dennis2'});

        broadcasts = [];

        lobbyServer.close(sessionId);

        console.log(broadcasts);
        console.log(messages);

        expect(broadcasts).toEqual([
            {action: 'lobby-member-quit', id: 'u1'},
            {
                action: 'lobby-member-update',
                member: {id: 'u2', name: 'Dennis2', admin: true}
            }
        ]);
    });
});
