import { w3cwebsocket as W3CWebSocket } from "websocket";
import { StateMutation} from "~/state/store";
import {addPlayer, AppState, connected, removePlayer} from "~/state/action";


type Mutate = (m: StateMutation) => { mutation: (state: AppState) => void; type: string };

let client = null;

export function initConnection(mutate: Mutate) {
    client = new W3CWebSocket('ws://127.0.0.1:8000');
    // const client = new W3CWebSocket('ws://edge-chat-demo.cloudflareworkers.com/api/room/house2/websocket');

    client.onopen = () => {
        console.log('WebSocket Client Connected');
        mutate(connected());
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

export function join(name: string) {
    client.send(JSON.stringify({ name }));
}



