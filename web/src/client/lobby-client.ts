import {Mutate} from "~/state/store";
import {IPlayer} from "~/general.types";
import {addPlayer, removePlayerById, updatePlayer, updateUser} from "~/state/action";

interface ILobbyDebugAction {
    action: 'lobby-debug';
    debug: any;
}

interface ILobbyMemberJoinAction {
    action: 'lobby-member-join';
    member: IPlayer;
}

interface ILobbyMemberUpdateAction {
    action: 'lobby-member-update';
    member: IPlayer;
}

interface ILobbyMemberQuitAction {
    action: 'lobby-member-quit';
    id: string;
}

type Action = ILobbyMemberJoinAction | ILobbyMemberUpdateAction | ILobbyMemberQuitAction | ILobbyDebugAction;

export const closeReasonKicked = 'REASON_KICKED';
export const closeReasonLeft = 'REASON_LEFT';
export const closeReasonLeft2 = '';

export class LobbyClient {
    constructor(private mutate: Mutate) { }

    close(reason: string) {
        this.mutate(state => {
            state.connectionLost = true;
            state.connectionLostReason = reason;
        });
        if (reason === closeReasonKicked) {
            console.log('You were kicked.');
            this.mutate(updateUser({id: undefined, name: undefined}));
        } else if (reason === closeReasonLeft || reason === closeReasonLeft2) {
            console.log('You left the lobby.');
            this.mutate(updateUser({id: undefined, name: undefined}));
        } else {
            console.log('Connection lost.', event);
        }
    }

    message(action: Action) {
        if (action.action === 'lobby-debug') {
            console.log('Lobby debug', (new Date(action.debug) as Date).toLocaleString());
        }
        if (action.action === 'lobby-member-join') {
            this.mutate(addPlayer(action.member));
            this.mutate(state => {
                if (state.user.id === action.member.id) {
                    updateUser(action.member)(state);
                }
            });
        }
        if (action.action === 'lobby-member-update') {
            this.mutate(updatePlayer(action.member));
            this.mutate(state => {
                if (state.user.id === action.member.id) {
                    updateUser(action.member)(state);
                }
            });
        }
        if (action.action === 'lobby-member-quit') {
            this.mutate(removePlayerById(action.id));
        }
    }
}
