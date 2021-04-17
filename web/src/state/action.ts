import {IPlayer} from "~/general.types";



export function connected() {
    return (state: AppState) => {
        state.connected = true;
    };
}

export function addPlayer(player: IPlayer) {
    return (state: AppState) => {
        state.players = [...state.players, player];
    };
}

export function removePlayer(player: IPlayer) {
    return (state: AppState) => {
        state.players = state.players.filter(p => p.name != player.name);
    };
}


export interface AppState {
    connected: boolean;
    players: IPlayer[];
    lastUpdate: number;
    light: boolean;
    count: number;
}

export const initialState: AppState = {
    connected: false,
    players: [],
    lastUpdate: 0,
    light: false,
    count: 0,
}
