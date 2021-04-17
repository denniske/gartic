
import { w3cwebsocket as W3CWebSocket } from "websocket";


export function initConnection() {
    // const client = new W3CWebSocket('ws://127.0.0.1:8000');
    const client = new W3CWebSocket('ws://edge-chat-demo.cloudflareworkers.com/api/room/house/websocket');

    client.onopen = () => {
        console.log('WebSocket Client Connected');
        client.send(JSON.stringify({ name: 'John' }));
    };
    client.onmessage = (messageEvent) => {
        const message = JSON.parse(messageEvent.data as string);
        console.log(message);
    };
}


