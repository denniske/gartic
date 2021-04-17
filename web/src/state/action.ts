import {IPlayer} from "~/general.types";



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
    players: IPlayer[];
    lastUpdate: number;
    light: boolean;
    count: number;
}

export const initialState = {
    players: [],
    lastUpdate: 0,
    light: false,
    count: 0,
}
