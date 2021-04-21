import {IConfig, IPlayer, IStorybook} from "~/general.types";


export function returnToLobby() {
    return (state: AppState) => {
        state.game.screen = '';
    };
}

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

export function updatePlayer(player: IPlayer) {
    return (state: AppState) => {
        const existingPlayer = state.players.find(p => p.id == player.id);
        Object.assign(existingPlayer, player);
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
    roundStartTime?: Date;

    // Debug
    round?: number;
}

export interface ReplayState {
    storybook?: IStorybook;
}

export interface AppState {
    connectionLost?: boolean;
    connectionLostReason?: string;
    game: GameState;
    connected: boolean;
    code: string;
    user: IPlayer;
    config: IConfig;
    players: IPlayer[];
    playersDone: number;
    replay: ReplayState;
    lastUpdate: number;
    light: boolean;
    count: number;
}

export const initialState: AppState = {
    game: {
        screen: '',
    },
    replay: {
        storybook: undefined,
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
