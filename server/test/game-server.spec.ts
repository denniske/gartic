import LobbyServer from "../src/server/lobby-server";
import {IChatRoom} from "../src/chat-room";
import GameServer from "../src/server/game-server";
import {ChatRoomMock} from "../src/mock";


let broadcasts: any[] = [];
let messages: any[] = [];

let lobbyServer: LobbyServer;
let gameServer: GameServer;

let lobbyChatRoomMock = new ChatRoomMock(broadcasts, messages);
let gameChatRoomMock = new ChatRoomMock(broadcasts, messages);

describe('GameServer', () => {
    beforeEach(() => {
        broadcasts.length = 0;
        messages.length = 0;
        lobbyServer = new LobbyServer(lobbyChatRoomMock);
        gameServer = new GameServer(gameChatRoomMock, lobbyServer);
        lobbyChatRoomMock.server = lobbyServer;
        gameChatRoomMock.server = gameServer;
    });

    test('2 players', () => {
        const sessionId = 's1';
        lobbyServer.open(sessionId);
        lobbyServer.message(sessionId, {action: 'lobby-join', id: 'u1', name: 'Dennis'});
        const sessionId2 = 's2';
        lobbyServer.open(sessionId2);
        lobbyServer.message(sessionId2, {action: 'lobby-join', id: 'u2', name: 'John'});

        broadcasts.length = 0;
        messages.length = 0;

        gameServer.message(sessionId, { action: 'start' });
        gameServer.message(sessionId, { action: 'storyDone', text: 'Dennis-1' });
        gameServer.message(sessionId2, { action: 'storyDone', text: 'John-1' });
        gameServer.message(sessionId, { action: 'storyDone', text: 'Dennis-2' });
        gameServer.message(sessionId2, { action: 'storyDone', text: 'John-2' });

        gameServer.message(sessionId, { action: 'replay' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayBook', index: 1 });
        gameServer.message(sessionId, { action: 'replayNextEntry' });

        console.log(broadcasts);
        console.log(messages);

        console.log(gameServer.getStory(0));
        console.log(gameServer.getStory(1));

        // expect(broadcasts).toEqual([
        //     expect.objectContaining({
        //         action: 'start'
        //     }),
        // ]);
    });

    test.each(Array(20).fill('i').map((x, i) => i))('3 players (%s)', () => {
        const sessionId = 's1';
        lobbyServer.open(sessionId);
        lobbyServer.message(sessionId, {action: 'lobby-join', id: 'u1', name: 'Dennis'});
        const sessionId2 = 's2';
        lobbyServer.open(sessionId2);
        lobbyServer.message(sessionId2, {action: 'lobby-join', id: 'u2', name: 'John'});
        const sessionId3 = 's3';
        lobbyServer.open(sessionId3);
        lobbyServer.message(sessionId3, {action: 'lobby-join', id: 'u3', name: 'Walter'});

        broadcasts.length = 0;
        messages.length = 0;

        gameServer.message(sessionId, { action: 'start' });
        gameServer.message(sessionId, { action: 'storyDone', text: 'Dennis-1' });
        gameServer.message(sessionId2, { action: 'storyDone', text: 'John-1' });
        gameServer.message(sessionId3, { action: 'storyDone', text: 'Walter-1' });
        gameServer.message(sessionId, { action: 'storyDone', text: 'Dennis-2' });
        gameServer.message(sessionId2, { action: 'storyDone', text: 'John-2' });
        gameServer.message(sessionId3, { action: 'storyDone', text: 'Walter-2' });
        gameServer.message(sessionId, { action: 'storyDone', text: 'Dennis-3' });
        gameServer.message(sessionId2, { action: 'storyDone', text: 'John-3' });
        gameServer.message(sessionId3, { action: 'storyDone', text: 'Walter-3' });

        gameServer.message(sessionId, { action: 'replay' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayBook', index: 1 });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayBook', index: 2 });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });

        console.log(broadcasts);
        console.log(messages);

        console.log(gameServer.getStory(0));
        console.log(gameServer.getStory(1));
        console.log(gameServer.getStory(2));

        // expect(broadcasts).toEqual([
        //     expect.objectContaining({
        //         action: 'start'
        //     }),
        // ]);
    });

    test.each(Array(20).fill('i').map((x, i) => i))('4 players (%s)', () => {
        const sessionId = 's1';
        lobbyServer.open(sessionId);
        lobbyServer.message(sessionId, {action: 'lobby-join', id: 'u1', name: 'Dennis'});
        const sessionId2 = 's2';
        lobbyServer.open(sessionId2);
        lobbyServer.message(sessionId2, {action: 'lobby-join', id: 'u2', name: 'John'});
        const sessionId3 = 's3';
        lobbyServer.open(sessionId3);
        lobbyServer.message(sessionId3, {action: 'lobby-join', id: 'u3', name: 'Walter'});
        const sessionId4 = 's4';
        lobbyServer.open(sessionId4);
        lobbyServer.message(sessionId4, {action: 'lobby-join', id: 'u4', name: 'Mike'});

        broadcasts.length = 0;
        messages.length = 0;

        gameServer.message(sessionId, { action: 'start' });
        gameServer.message(sessionId, { action: 'storyDone', text: 'Dennis-1' });
        gameServer.message(sessionId2, { action: 'storyDone', text: 'John-1' });
        gameServer.message(sessionId3, { action: 'storyDone', text: 'Walter-1' });
        gameServer.message(sessionId4, { action: 'storyDone', text: 'Mike-1' });
        gameServer.message(sessionId, { action: 'storyDone', text: 'Dennis-2' });
        gameServer.message(sessionId2, { action: 'storyDone', text: 'John-2' });
        gameServer.message(sessionId3, { action: 'storyDone', text: 'Walter-2' });
        gameServer.message(sessionId4, { action: 'storyDone', text: 'Mike-2' });
        gameServer.message(sessionId, { action: 'storyDone', text: 'Dennis-3' });
        gameServer.message(sessionId2, { action: 'storyDone', text: 'John-3' });
        gameServer.message(sessionId3, { action: 'storyDone', text: 'Walter-3' });
        gameServer.message(sessionId4, { action: 'storyDone', text: 'Mike-3' });
        gameServer.message(sessionId, { action: 'storyDone', text: 'Dennis-4' });
        gameServer.message(sessionId2, { action: 'storyDone', text: 'John-4' });
        gameServer.message(sessionId3, { action: 'storyDone', text: 'Walter-4' });
        gameServer.message(sessionId4, { action: 'storyDone', text: 'Mike-4' });

        gameServer.message(sessionId, { action: 'replay' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayBook', index: 1 });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayBook', index: 2 });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayBook', index: 3 });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });
        gameServer.message(sessionId, { action: 'replayNextEntry' });

        console.log(broadcasts);
        console.log(messages);

        console.log(gameServer.getStory(0));
        console.log(gameServer.getStory(1));
        console.log(gameServer.getStory(2));
        console.log(gameServer.getStory(3));

        // expect(broadcasts).toEqual([
        //     expect.objectContaining({
        //         action: 'start'
        //     }),
        // ]);
    });
});
