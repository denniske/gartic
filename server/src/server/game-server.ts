import {IChatRoom} from "../chat-room";
import LobbyServer, {IMember} from "./lobby-server";
import {cloneDeep, remove} from "lodash";
import {generatePairing, generatePairings, Pairing} from "../pairing";

interface IStoryEntry {
    userId: string;
    userName: string;
    text: string;
    shown: boolean;
}

interface IStoryEditAction {
    action: 'storyEdit';
}

interface IStoryDoneAction {
    action: 'storyDone';
    text: string;
}

interface IStartAction {
    action: 'start';
}

interface IReplayAction {
    action: 'replay';
}

interface IRestartAction {
    action: 'restart';
}

interface IReplayBookAction {
    action: 'replayBook';
    index: number;
}

interface IReplayNextEntryAction {
    action: 'replayNextEntry';
}

type Action =
    IStoryEditAction
    | IStoryDoneAction
    | IStartAction
    | IReplayAction
    | IReplayBookAction
    | IReplayNextEntryAction
    | IRestartAction;

enum State {
    StartStory = 'START_STORY',
    ContinueStory = 'CONTINUE_STORY',
    Finished = 'FINISHED',
}

interface IGameMember extends IMember {
    currentTargetIndex?: number;
    currentInput?: string;
    done?: boolean;
    connected: boolean;
}

interface IStorybook {
    index: number;
    entries: IStoryEntry[];
    user: IMember;
    last?: boolean;
    new?: boolean;
}

const dummyNames = ['Dennis', 'John'];

function createDummyStory(userId: string, index: number): IStoryEntry[] {
    return [
        {
            userId: userId,
            userName: dummyNames[index],
            text: dummyNames[index]+'0',
            shown: true,
        },
        {
            userId: userId,
            userName: dummyNames[(index+1)%2],
            text: dummyNames[(index+1)%2]+'1',
            shown: false,
        },
    ];
}

export default class GameServer {
    state: State = State.StartStory;
    storyLength: number = 0;
    timerStarted?: Date;

    members: IGameMember[] = [];

    pairings: Pairing[] = [];
    storybooks: IStorybook[] = [];

    constructor(private chatRoom: IChatRoom, private lobbyServer: LobbyServer) {
    }

    getStorybookForMember(memberId: string) {
        return this.storybooks.find(s => s.user.id == memberId)!;
    }

    sendStorybook(index: number) {
        const storybook = this.storybooks[index];

        const entriesToSend = [];
        for (const entry of storybook.entries) {
            if (entry.shown) {
                entriesToSend.push(entry);
            } else {
                entriesToSend.push(entry);
                break;
            }
        }

        this.chatRoom.broadcast({
            action: 'storybook',
            storybook: {
                ...storybook,
                entries: entriesToSend,
            },
        });

        const storybookComplete = storybook.entries.every(e => e.shown);
        if (storybookComplete) {
            storybook.new = false;
        }
    }

    markLastStorybookEntryAsShown() {
        const index = this.storybooks.findIndex(storybook => storybook.entries.find(e => !e.shown));
        const storybook = this.storybooks[index];

        for (const entry of storybook.entries) {
            if (!entry.shown) {
                entry.shown = true;
                break;
            }
        }

        return index;
    }

    timer() {
        // 60 seconds
        if (this.timerStarted && (new Date().getTime() - this.timerStarted.getTime()) / 1000 > 60) {
            this.timerStarted = undefined;
            this.newRound();
        }
    }

    open(sessionId: string) {
        setInterval(() => this.timer(), 1000);
    }

    close(sessionId: string) {
        const member = this.members.find(m => m.sessionId == sessionId);
        const memberIndex = this.members.findIndex(m => m.sessionId == sessionId);

        console.log('CLOSED', memberIndex, sessionId);

        if (member != null) {
            member.connected = false;
            remove(this.pairings, p => p[0] == memberIndex || p[1] == memberIndex);
        }
    }

    startTimer() {
        this.timerStarted = new Date();
    }

    stopTimer() {
        this.timerStarted = undefined;
    }

    message(sessionId: string, action: Action) {
        console.log();
        if (action.action === 'start') {
            this.state = State.StartStory;
            this.storyLength = 0;
            this.members = this.lobbyServer.members.map(member => ({
                ...member,
                connected: true,
            }));
            this.pairings = generatePairings(this.members.length);
            this.storybooks = this.members.map((m, i) => ({
                index: i,
                user: m,
                entries: [],
                last: i == this.members.length - 1,
            }));
            this.chatRoom.broadcast({action: 'start', time: new Date()});
            this.startTimer();


        }
        if (action.action === 'restart') {
            this.chatRoom.broadcast({action: 'restart'});
        }

        if (action.action === 'replay') {
            // this.members = cloneDeep(this.lobbyServer.members);
            // this.storybooks = [
            //     {
            //         index: 0,
            //         entries: createDummyStory(this.members[0].id!, 0),
            //         user: this.members[0],
            //         last: false,
            //         new: true,
            //     },
            //     {
            //         index: 1,
            //         entries: createDummyStory(this.members[1].id!, 1),
            //         user: this.members[1],
            //         last: false,
            //         new: true,
            //     },
            // ]
            this.chatRoom.broadcast({action: 'replay'});
            this.sendStorybook(0);
        }
        if (action.action === 'replayNextEntry') {
            const index = this.markLastStorybookEntryAsShown();
            this.sendStorybook(index);
        }
        if (action.action === 'replayBook') {
            this.sendStorybook(action.index);
        }

        if (action.action === 'storyEdit') {
            const member = this.members.find(m => m.sessionId == sessionId);

            if (member == null) {
                console.error(`Member for session ${sessionId} not found.`);
                return;
            }

            member.done = false;

            const playersDoneCount = this.members.filter(m => m.done).length;
            this.chatRoom.broadcast({action: 'playersDone', count: playersDoneCount});
        }
        if (action.action === 'storyDone') {
            const member = this.members.find(m => m.sessionId == sessionId);

            if (member == null) {
                console.error(`Member for session ${sessionId} not found.`);
                return;
            }

            member.currentInput = action.text;
            member.done = true;

            const playersDoneCount = this.members.filter(m => m.done).length;
            this.chatRoom.broadcast({action: 'playersDone', count: playersDoneCount});


            // const state = JSON.stringify([this.members, this.storybooks]);
            const state = JSON.stringify(this.storybooks);
            console.log('size', Buffer.byteLength(state, 'utf8')/1000, 'kB');
            console.log('size', Buffer.byteLength('1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890', 'utf8')/1000, 'kB');


            if (this.members.filter(m => m.connected).every(m => m.done)) {
                this.newRound();
            }
        }
    }

    newRound() {
        switch (this.state) {
            case State.StartStory:
                for (const m of this.members) {
                    const storybook = this.getStorybookForMember(m.id!);
                    storybook.entries.push({
                        userId: m.id!,
                        userName: m.name!,
                        text: m.currentInput!,
                        shown: true,
                    });
                }
                this.state = State.ContinueStory;
                this.members.forEach(m => m.currentInput = '');
                this.members.forEach(m => m.done = false);
                this.storyLength = 1;
                break;
            case State.ContinueStory:
                console.log('members', this.members);
                for (const m of this.members) {
                    const storybook = this.storybooks[m.currentTargetIndex!];
                    storybook.entries.push({
                        userId: m.id!,
                        userName: m.name!,
                        text: m.currentInput!,
                        shown: false,
                    });
                }
                this.members.forEach(m => m.currentInput = '');
                this.members.forEach(m => m.done = false);
                this.storyLength++;
                break;
        }

        // Distribute stories randomly
        if (this.storyLength < this.members.filter(m => m.connected).length) {
            this.chatRoom.broadcast({action: 'nextRound', round: this.storyLength, time: new Date()});
            this.startTimer();

            this.members.forEach(m => m.currentTargetIndex = undefined);

            console.log('Distribute stories randomly', this.members);

            const pairing = generatePairing(this.pairings, this.members.length);
            pairing.forEach(p => this.members[p[0]].currentTargetIndex = p[1]);
            pairing.forEach(p => remove(this.pairings, x => x == p));

            for (const distMember of this.members) {
                const targetStorybook = this.storybooks[distMember.currentTargetIndex!];
                this.chatRoom.send(distMember.sessionId, {
                    action: 'previousStory',
                    text: targetStorybook.entries[targetStorybook.entries.length - 1].text,
                });
            }
        } else {
            this.state = State.Finished;
            this.chatRoom.broadcast({action: 'finished'});
            this.stopTimer();
            console.log(this.storybooks);
        }
    }

    getStory(index: number) {
        return this.storybooks[index].entries.map(e => e.text).join('\n');
    }
}
