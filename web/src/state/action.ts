import {IConfig, IPlayer} from "~/general.types";


export function connected() {
    return (state: AppState) => {
        state.connected = true;
    };
}

export function disconnected() {
    return (state: AppState) => {
        state.connected = false;
    };
}

export function updateConfig(config: IConfig) {
    return (state: AppState) => {
        Object.assign(state.config, config);
    };
}

export function updateUser(user: IPlayer) {
    return (state: AppState) => {
        Object.assign(state.user, user);
    };
}

export function addPlayer(player: IPlayer) {
    return (state: AppState) => {
        state.players = [...state.players, player];
    };
}

export function removePlayerById(playerId: string) {
    return (state: AppState) => {
        state.players = state.players.filter(p => p.id != playerId);
    };
}

export function clearPlayers() {
    return (state: AppState) => {
        state.players = [];
    };
}


export interface GameState {
    screen: string;
    previousStoryText?: string;

    // Debug
    round?: number;
}

export interface AppState {
    game: GameState;
    connected: boolean;
    code: string;
    user: IPlayer;
    config: IConfig;
    players: IPlayer[];
    playersDone: number;
    lastUpdate: number;
    light: boolean;
    count: number;
}

export const initialState: AppState = {
    game: {
        screen: '',
    },
    connected: false,
    code: undefined,
    user: {},
    config: {},
    players: [],
    playersDone: 0,
    lastUpdate: 0,
    light: false,
    count: 0,
}
