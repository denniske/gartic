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
import {GameClient} from "~/client/game-client";
import {closeReasonLeft, LobbyClient} from "~/client/lobby-client";


let client = null;
let mutate = null;

let gameClient: GameClient;
let lobbyClient: LobbyClient;

const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};

export function initConnection(_mutate: Mutate, code: string): Promise<void> {
    return new Promise(resolve => {
        mutate = _mutate;

        gameClient = new GameClient(mutate);
        lobbyClient = new LobbyClient(mutate);

        console.log('ENVIRONMENT', process.env.NEXT_PUBLIC_ENVIRONMENT);

        if (process.env.NEXT_PUBLIC_ENVIRONMENT == 'development') {
            client = new W3CWebSocket(`ws://127.0.0.1:8000/${code}`);
        } else {
            client = new W3CWebSocket(`wss://gartic.denniske.workers.dev/api/room/${code}/websocket`);
        }

        client.onopen = () => {
            console.log('WebSocket Client Connected');
            mutate(connected());
            resolve();
        };

        client.onmessage = (messageEvent) => {
            const message = JSON.parse(messageEvent.data as string);
            console.log(message);

            lobbyClient.message(message);
            gameClient.message(message);
        };

        client.onclose = (event: ICloseEvent) => {
            mutate(disconnected());

            console.log('closed', event);
            lobbyClient.close(event.reason);

            // if (event.reason === closeReasonKicked) {
            //     console.log('You were kicked.');
            //     mutate(updateUser({id: undefined, name: undefined}));
            // } else {
            //     console.log('Connection lost.', event);
            // }
        };
    });
}


export function lobbyDebug() {
    client.send(JSON.stringify({action: 'lobby-debug'}));
}

export function lobbyJoin(name: string) {
    const user = {id: getUniqueID()};
    mutate(updateUser(user));
    mutate(clearPlayers());
    client.send(JSON.stringify({ action: 'lobby-join', id: user.id, name: name }));
}

export function lobbyKick(playerId: string) {
    client.send(JSON.stringify({action: 'lobby-kick', id: playerId}));
}


export function actionStart() {
    client.send(JSON.stringify({action: 'start'}));
}

export function actionReplay() {
    client.send(JSON.stringify({action: 'replay'}));
}

export function actionReplayNextEntry() {
    client.send(JSON.stringify({action: 'replayNextEntry'}));
}

export function actionReplayBook(index: number) {
    client.send(JSON.stringify({action: 'replayBook', index }));
}

export function actionRestart() {
    client.send(JSON.stringify({action: 'restart' }));
}

export function actionStoryEdit() {
    client.send(JSON.stringify({action: 'storyEdit'}));
}

export function actionStoryDone(text: string) {
    client.send(JSON.stringify({action: 'storyDone', text}));
}

export function quit() {
    mutate(updateUser({id: undefined, name: undefined}));
    client.close(3000, closeReasonLeft);
}




