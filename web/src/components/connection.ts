import { w3cwebsocket as W3CWebSocket } from "websocket";
import { StateMutation} from "~/state/store";
import {addPlayer, AppState, removePlayer} from "~/state/action";


type Mutate = (m: StateMutation) => { mutation: (state: AppState) => void; type: string };

export function initConnection(mutate: Mutate) {
    // const client = new W3CWebSocket('ws://127.0.0.1:8000');
    const client = new W3CWebSocket('ws://edge-chat-demo.cloudflareworkers.com/api/room/house/websocket');

    client.onopen = () => {
        console.log('WebSocket Client Connected');
        client.send(JSON.stringify({ name: 'John' }));
    };

    client.onmessage = (messageEvent) => {
        const message = JSON.parse(messageEvent.data as string);
        console.log(message);

        if (message.joined) {
            mutate(addPlayer({ name: message.joined }));
        }
        if (message.quit) {
            mutate(removePlayer({ name: message.quit }));
        }
    };
}





