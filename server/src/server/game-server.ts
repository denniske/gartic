import {IChatRoom} from "../chat-room";
import LobbyServer, {IMember} from "./lobby-server";
import {selectRandomElement} from "../util";
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

type Action = IStoryEditAction | IStoryDoneAction | IStartAction | IReplayAction | IReplayBookAction | IReplayNextEntryAction | IRestartAction;

enum State {
    StartStory = 'START_STORY',
    ContinueStory = 'CONTINUE_STORY',
    Finished = 'FINISHED',
}

interface IGameMember extends IMember {
    currentTargetId?: string;
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

        // console.log(storybook.user);
        // console.log(this.members);

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
            if (!entry.shown) {
                entry.shown = true;
                break;
            }
        }

        return index;
    }

    close(sessionId: string) {

    }

    message(sessionId: string, action: Action) {
        console.log();
        // console.log('STATE', this.state);
        // console.log('STORY LENGTH', this.storyLength);
        // console.log('PROCESS', action.action);
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
        }
        if (action.action === 'restart') {
            this.chatRoom.broadcast({action: 'restart'});
        }
        if (action.action === 'replay') {
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

            // console.log('this.userInputs.size', inputCount);
            // console.log('this.members.length', this.members.length);

            if (playersDoneCount === this.members.length) {
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
                            const storybook = this.getStorybookForMember(m.currentTargetId!);
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

                // console.log('this.storyLength', this.storyLength);
                // console.log('this.members.length', this.members.length);

                // Distribute stories randomly
                if (this.storyLength < this.members.length) {
                    this.chatRoom.broadcast({action: 'nextRound', round: this.storyLength, time: new Date()});

                    this.members.forEach(m => m.currentTargetId = undefined);

                    console.log('Distribute stories randomly', this.members);


                    const pairing = generatePairing(this.pairings, this.members.length);
                    pairing.forEach(p => this.members[p[0]].currentTargetId = this.members[p[1]].id);
                    pairing.forEach(p => remove(this.pairings, x => x == p));

                    let availableStories = [...this.storybooks];

                    for (const distMember of this.members) {
                        console.log(distMember);
                        console.log('availableStories', JSON.stringify(availableStories, null, 4));

                        console.log('availableStories.length', availableStories.length);
                        const selectableStories = availableStories.filter(s =>
                            // Do not add to story which you already added to
                            !s.entries.some(storyEntry => storyEntry.userId === distMember.id) //&&
                            // Do not add to story whose target is you
                            // (this.members.length % 2 == 0 || this.members.find(m => m.id == s.user.id)!.currentTargetId != distMember.id)
                        );

                        console.log('selectableStories.length', selectableStories.length);
                        const selectedStory = selectRandomElement(selectableStories);
                        console.log('selectableStory', selectedStory);

                        distMember.currentTargetId = selectedStory.user.id;

                        this.chatRoom.send(distMember.sessionId, {
                            action: 'previousStory',
                            text: selectedStory.entries[selectedStory.entries.length - 1].text,
                        });

                        availableStories = availableStories.filter(s => s != selectedStory);
                    }
                } else {
                    this.state = State.Finished;
                    this.chatRoom.broadcast({action: 'finished'});
                    console.log(this.storybooks);
                }
            }
        }
    }

    getStory(index: number) {
        return this.storybooks[index].entries.map(e => e.text).join('\n');
    }
}
