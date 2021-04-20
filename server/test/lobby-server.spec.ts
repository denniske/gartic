import LobbyServer from "../src/server/lobby-server";
import {IChatRoom} from "../src/chat-room";
import {ChatRoomMock} from "../src/mock";


let broadcasts: any[] = [];
let messages: any[] = [];

let lobbyServer: LobbyServer;
let chatRoomMock = new ChatRoomMock(broadcasts, messages);

describe('LobbyServer', () => {
    beforeEach(() => {
        broadcasts.length = 0;
        messages.length = 0;
        lobbyServer = new LobbyServer(chatRoomMock);
        chatRoomMock.server = lobbyServer;
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

        broadcasts.length = 0;

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

        broadcasts.length = 0;

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

// const dummyNames = ['Dennis', 'John'];
//
// function createDummyStory(sessionId: string, index: number): IStoryEntry[] {
//     return [
//         {
//             userId: sessionId,
//             userName: dummyNames[index],
//             text: dummyNames[index]+'0',
//             shown: true,
//         },
//         {
//             userId: sessionId,
//             userName: dummyNames[(index+1)%2],
//             text: dummyNames[(index+1)%2]+'1',
//             shown: false,
//         },
//     ];
// }

// Fake data
// this.state = State.Finished;
// this.storyLength = 2;
// this.userStories.clear();
// this.userStories.set(this.sessions[0].id!, createDummyStory(this.sessions[0].id!, 0));
// this.userStories.set(this.sessions[1].id!, createDummyStory(this.sessions[1].id!, 1));
