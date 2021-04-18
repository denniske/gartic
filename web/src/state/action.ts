import {IConfig, IPlayer} from "~/general.types";


export function connected() {
    return (state: AppState) => {
        state.connected = true;
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


export interface AppState {
    connected: boolean;
    user: IPlayer;
    config: IConfig;
    players: IPlayer[];
    lastUpdate: number;
    light: boolean;
    count: number;
}

export const initialState: AppState = {
    connected: false,
    user: {},
    config: {},
    players: [],
    lastUpdate: 0,
    light: false,
    count: 0,
}
