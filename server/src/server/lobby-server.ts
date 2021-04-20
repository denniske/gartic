import {IChatRoom} from "../chat-room";


interface IDebugAction {
    action: 'lobby-debug';
}

interface IKickAction {
    action: 'lobby-kick';
    id: string;
}

interface IJoinAction {
    action: 'lobby-join';
    id: string;
    name: string;
}

type Action = IKickAction | IJoinAction | IDebugAction;

const closeReasonKicked = 'REASON_KICKED';

export interface IMember {
    sessionId: string;
    id?: string;
    name?: string;
    admin?: boolean;
}

export default class LobbyServer {
    created: Date | null;
    members: IMember[];

    constructor(private chatRoom: IChatRoom) {
        this.created = null;
        this.members = [];
    }

    open(sessionId: string) {
        this.created = this.created ?? new Date();
    }

    close(sessionId: string) {
        const member = this.members.find(m => m.sessionId == sessionId);
        if (member == null) {
            console.error(`WARN Session close. Could not find member for session ${sessionId}`);
            return;
        }
        this.chatRoom.broadcast({
            action: 'lobby-member-quit',
            id: member.id
        });
        this.members = this.members.filter(m => m != member);
        this.determineNewAdmin();
    }

    message(sessionId: string, action: Action) {
        console.log();
        if (action.action == 'lobby-debug') {
            this.chatRoom.send(sessionId, { action: 'lobby-debug', debug: this.created });
        }
        if (action.action == 'lobby-join') {
            if (action.id == null) {
                this.chatRoom.send(sessionId, {error: "No id specified."});
                this.chatRoom.close(sessionId, 1009, "No id specified.");
                return;
            }
            if (action.name.length > 32) {
                this.chatRoom.send(sessionId, {error: "Name too long."});
                this.chatRoom.close(sessionId, 1009, "Name too long.");
                return;
            }

            const member: IMember = {
                sessionId,
                id: action.id,
                name: action.name,
                admin: false,
            };

            this.members.push(member);

            if (this.members.filter(m => m.admin).length === 0) {
                member.admin = true;
            }

            // Send all existing users to new connection.
            this.members.filter(m => m != member).forEach(m => {
                this.chatRoom.send(sessionId, {
                    action: 'lobby-member-join',
                    member: {id: m.id, name: m.name, admin: m.admin},
                })
            });

            // Broadcast that this user has joined.
            this.chatRoom.broadcast({
                action: 'lobby-member-join',
                member: {id: member.id, name: member.name, admin: member.admin},
            });
        }
        if (action.action == 'lobby-kick') {
            const member = this.members.find(m => m.id == action.id);
            if (member) {
                this.chatRoom.close(member.sessionId, 1000, closeReasonKicked);
            }
        }
    }

    determineNewAdmin() {
        if (this.members.length === 0) return;
        if (this.members.some(s => s.admin)) return;

        this.members[0].admin = true;

        this.chatRoom.broadcast({
            action: 'lobby-member-update',
            member: {id: this.members[0].id, name: this.members[0].name, admin: this.members[0].admin},
        });
    }
}

