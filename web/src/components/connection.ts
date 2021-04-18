import {ICloseEvent, w3cwebsocket as W3CWebSocket} from "websocket";
import {Mutate, StateMutation} from "~/state/store";
import {
    addPlayer,
    AppState,
    clearPlayers,
    connected,
    disconnected,
    removePlayerById,
    updateConfig,
    updateUser
} from "~/state/action";
import {GameClient} from "~/components/game-client";


let client = null;
let mutate = null;

const closeCodeKicked = 1100;

let gameClient: GameClient;

const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};

export function initConnection(_mutate: Mutate, code: string) {
    mutate = _mutate;

    gameClient = new GameClient(mutate);

    console.log('ENVIRONMENT', process.env.NEXT_PUBLIC_ENVIRONMENT);

    if (process.env.NEXT_PUBLIC_ENVIRONMENT == 'development') {
        client = new W3CWebSocket(`ws://127.0.0.1:8000/${code}`);
    } else {
        client = new W3CWebSocket(`ws://gartic.denniske.workers.dev/api/room/${code}/websocket`);
    }

    client.onopen = () => {
        console.log('WebSocket Client Connected');
        mutate(connected());
    };

    client.onmessage = (messageEvent) => {
        const message = JSON.parse(messageEvent.data as string);
        console.log(message);

        if (message.action) {
            gameClient.processActionFromServer(message);
        }
        if (message.joined) {
            mutate(addPlayer({id: message.joined.id, name: message.joined.name}));
        }
        if (message.config) {
            mutate(updateConfig(message.config));
        }
        if (message.quit) {
            mutate(removePlayerById(message.quit));
        }
    };

    client.onclose = (event: ICloseEvent) => {
        mutate(disconnected());
        if (event.code === closeCodeKicked) {
            console.log('You were kicked.');
        } else {
            console.log('Connection lost.', event);
        }
    };
}


export function join(name: string) {
    const user = {id: getUniqueID(), name};
    mutate(updateUser(user));
    mutate(clearPlayers());
    client.send(JSON.stringify(user));
}

export function kick(playerId: string) {
    client.send(JSON.stringify({kick: playerId}));
}

export function actionStart() {
    client.send(JSON.stringify({action: 'start'}));
}

export function actionStory(text: string) {
    client.send(JSON.stringify({action: 'story', text}));
}

export function quit() {
    mutate(updateUser({id: undefined, name: undefined}));
    client.close();
}




