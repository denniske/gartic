
export const roundTime = 60;

export interface IConfig {
    adminSessionId?: string;
}

export interface IPlayer {
    id?: string;
    name?: string;
    admin?: boolean;
}

export interface IStorybook {
    index: number;
    entries: IStorybookEntry[];
    user: IPlayer;
    last: boolean;
}

export interface IStorybookEntry {
    userId: string;
    userName: string;
    text: string;
    shown: boolean;
}
