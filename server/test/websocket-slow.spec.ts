import {ICloseEvent, w3cwebsocket} from "websocket";

const code = 8000;

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class SocketClient {
    client?: w3cwebsocket;
    messages: any[] = [];

    connect(code: number) {
        return new Promise((resolve => {
            this.client = new w3cwebsocket(`wss://gartic.denniske.workers.dev/api/room/${code}/websocket`);
            this.client.onopen = () => {
                console.log('WebSocket Client Connected');
                resolve(() => {
                });
            };
            this.client.onmessage = (messageEvent) => {
                const message = JSON.parse(messageEvent.data as string);
                console.log('message', message);
                this.messages.push(message);
            };

            this.client.onclose = (event: ICloseEvent) => {
                // console.log('WebSocket Client Closed');
                // lobbyClient.close(event.reason);
            };
        }));
    }

    async send(message: any) {
        await sleep(5000 + 500);
        this.client!.send(JSON.stringify(message));
    }
}

let index = 0;

describe('Websocket', () => {
    beforeEach(() => {

    });

    test.each(Array(1000).fill('i').map((x, i) => i))('2 players (%s)', async () => {
        jest.setTimeout(5 * 60 * 1000);

        console.log(new Date());
        const client = new SocketClient();
        await client.connect(code + index);
        await client.send({action: 'lobby-join', id: 'u1', name: 'Dennis'});
        const client2 = new SocketClient();
        await client2.connect(code + index);
        await client2.send({action: 'lobby-join', id: 'u2', name: 'John'});

        await client.send({action: 'start'});
        await client.send({action: 'storyDone', text: 'Dennis-1'});
        await client2.send({action: 'storyDone', text: 'John-1'});
        await client.send({action: 'storyDone', text: 'Dennis-2'});
        await client2.send({action: 'storyDone', text: 'John-2'});

        await client.send({action: 'replay'});
        await client.send({action: 'replayNextEntry'});
        await client.send({action: 'replayBook', index: 1});
        await client.send({action: 'replayNextEntry'});

        await sleep(100);

        client.client!.close();
        client2.client!.close();

        console.log(client.messages);
        console.log(client2.messages);

        expect(client.messages.filter(m => m.action == 'storybook').length).toEqual(4);
        expect(client2.messages.filter(m => m.action == 'storybook').length).toEqual(4);

        await sleep(5 * 60 * 1000);

        index++;
    });
});
