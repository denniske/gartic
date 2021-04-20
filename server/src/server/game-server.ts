import {IChatRoom} from "../chat-room";
import LobbyServer, {IMember} from "./lobby-server";
import {cloneDeep, remove} from "lodash";
import {generatePairing, generatePairings, Pairing} from "../pairing";

interface IStoryEntry {
    userId: string;
    userName: string;
    text: string;
    shown: boolean;
    new: boolean;
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
}

interface IStorybook {
    index: number;
    entries: IStoryEntry[];
    user: IMember;
    last?: boolean;
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

    sendStorybook(index: number, markLastEntryAsNew: boolean = false) {
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

        if (markLastEntryAsNew) {
            const shown = entriesToSend.filter(e => e.shown);
            const lastShown = shown[shown.length-1];
            lastShown.new = true;
        }

        this.chatRoom.broadcast({
            action: 'storybook',
            storybook: {
                index,
                last: index == this.storybooks.length - 1,
                entries: entriesToSend,
                user: {
                    id: storybook.user.id,
                    name: storybook.user.name,
                },
            }
        });
    }

    markLastStorybookEntryAsShown() {
        const index = this.storybooks.findIndex(storybook => storybook.entries.find(e => !e.shown));
        const storybook = this.storybooks[index];

        for (const entry of storybook.entries) {
            // entry.new = false

            if (!entry.shown) {
                entry.shown = true;
                // entry.new = true;
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
            this.members = cloneDeep(this.lobbyServer.members);
            this.pairings = generatePairings(this.members.length);
            this.storybooks = this.members.map((m, i) => ({
                index: i,
                user: m,
                entries: [],
            }));
            this.chatRoom.broadcast({action: 'start', time: new Date()});
            this.startTimer();
        }
        if (action.action === 'restart') {
            this.chatRoom.broadcast({action: 'restart'});
        }
        if (action.action === 'replay') {
            this.chatRoom.broadcast({action: 'replay'});
            this.sendStorybook(0, true);
        }
        if (action.action === 'replayNextEntry') {
            const index = this.markLastStorybookEntryAsShown();
            this.sendStorybook(index, true);
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

            if (playersDoneCount === this.members.length) {
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
                        new: false,
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
                        new: false,
                    });
                }
                this.members.forEach(m => m.currentInput = '');
                this.members.forEach(m => m.done = false);
                this.storyLength++;
                break;
        }

        // Distribute stories randomly
        if (this.storyLength < this.members.length) {
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
