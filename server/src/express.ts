import { orderBy } from "lodash";
import {connection, server} from "websocket";
import {ChatRoom} from "./chat-room";
import {WebSocketLike} from "./types";

const webSocketsServerPort = 8000;
// const webSocketServer = require('websocket').server;

const http = require('http');

// Spinning the http server and the websocket server.
const server2 = http.createServer();
server2.listen(webSocketsServerPort);

const wsServer = new server({
    httpServer: server2
});

// I'm maintaining all active connections in this object
const clients = {} as any;

// interface IPair {
//     key: string;
//     value: any;
// }

type IPair = [string, any];

class DurableObjectStorageMock {

    data: Map<string, any> = new Map<string, any>();

    put(key: string, value: unknown) {
        console.log('storage.get called with', arguments);
        this.data.set(key, value);
    }

    list(options?: DurableObjectListOptions): Promise<Map<string, any>> {
        console.log('storage.list called with', arguments);

        const { start, end, limit, prefix, reverse } = options ?? {};

        let pairs: IPair[] = [];
        for (const [key, value] of this.data.entries()) {
            if (prefix == null || key.startsWith(prefix)) {
                pairs.push([key, value]);
                // pairs.push({key, value});
            }
        }

        pairs = orderBy(pairs, p => p[0]);
        // pairs = orderBy(pairs, p => p.key);

        // start, end

        if (limit != null) {
            pairs = pairs.filter((p, i) => i < limit);
        }

        const result: Map<string, any> = new Map<string, any>(pairs);

        return new Promise((resolve) => {
            resolve(result);
        })
    }
}

const storageMock = new DurableObjectStorageMock();

const controller = {
    id: '',
    storage: storageMock as any,
    waitUntil: (promise: Promise<any>) => {},
};
const env = {};

const chatRoom = new ChatRoom(controller, env);

console.log('Started');

// This code generates unique userid for everyuser.
const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};


class WebsocketMock implements WebSocketLike {
    constructor(private connection: connection) {}

    accept(): void { }

    addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: any, listener: any, options?: boolean | AddEventListenerOptions): void {
        if (type === 'message') {
            this.connection.addListener('message', (msg) => {
                listener({ data: msg.utf8Data });
            });
            return;
        }
        this.connection.addListener(type, listener);
    }

    close(code?: number, reason?: string): void {
        this.connection.close(code, reason);
    }

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        this.connection.send(data);
    }
}


wsServer.on('request', function(request) {
    var userID = getUniqueID();
    console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
    // You can rewrite this part of the code to accept only the requests from allowed origin
    const connection = request.accept(undefined, request.origin);
    clients[userID] = connection;
    console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients))

    const webSocketMock = new WebsocketMock(connection);
    chatRoom.handleSession(webSocketMock, '127.0.0.1');
});
