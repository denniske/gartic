import {ChatRoom, ISession} from "../chat-room";

interface IStoryEntry {
    userId: string;
    userName: string;
    text: string;
    shown: boolean;
}

interface IStoryAction {
    action: 'story';
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

type Action = IStoryAction | IStartAction | IReplayAction | IReplayBookAction | IReplayNextEntryAction | IRestartAction;

enum State {
    StartStory = 'START_STORY',
    ContinueStory = 'CONTINUE_STORY',
    Finished = 'FINISHED',
}

function selectRandomElement<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

const dummyNames = ['Dennis', 'John'];

function createDummyStory(sessionId: string, index: number): IStoryEntry[] {
    return [
        {
            userId: sessionId,
            userName: dummyNames[index],
            text: dummyNames[index]+'0',
            shown: true,
        },
        {
            userId: sessionId,
            userName: dummyNames[(index+1)%2],
            text: dummyNames[(index+1)%2]+'1',
            shown: false,
        },
    ];
}

export default class GameServer {
    state: State = State.StartStory;
    storyLength: number = 0;
    userStories: Map<string, IStoryEntry[]> = new Map<string, IStoryEntry[]>();
    userInputs: Map<string, string> = new Map<string, string>();
    userTargets: Map<string, string> = new Map<string, string>();

    public get sessions() {
        return this.chatRoom.sessions;
    }

    constructor(private chatRoom: ChatRoom) { }

    sendStorybook(index: number) {
        const books = Array.from(this.userStories.entries());
        const [userId, entries] = books[index];

        const entriesToSend = [];
        for (const entry of entries) {
            if (entry.shown) {
                entriesToSend.push(entry);
            } else {
                entriesToSend.push(entry);
                break;
            }
        }

        console.log(userId);
        console.log(this.sessions);

        this.chatRoom.broadcast({
            action: 'storybook',
            storybook: {
                index,
                last: index == books.length-1,
                entries: entriesToSend,
                user: {
                    id: userId,
                    name: 'SomeUser', // this.sessions.find(s => s.id === userId)!.name,
                },
            }
        });
    }

    markLastStorybookEntryAsShown() {
        const books = Array.from(this.userStories.entries());
        const index = books.findIndex(book => book[1].find(e => !e.shown));
        const [userId, entries] = books[index];

        for (const entry of entries) {
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
        console.log('STATE', this.state);
        console.log('STORY LENGTH', this.storyLength);
        console.log('PROCESS', action.action);
        if (action.action === 'start') {
            this.state = State.StartStory;
            this.storyLength = 0;
            this.userStories.clear();

            // Fake data
            // this.state = State.ContinueStory;
            // this.storyLength = 2;
            // this.userStories.set(this.sessions[0].id!, createDummyStory(this.sessions[0].id!, 0));
            // this.userStories.set(this.sessions[1].id!, createDummyStory(this.sessions[1].id!, 1));

            this.userInputs.clear();
            this.userTargets.clear();
            this.chatRoom.broadcast({ action: 'start', time: new Date() });
            return;
        }
        if (action.action === 'restart') {
            this.chatRoom.broadcast({ action: 'restart' });
            return;
        }
        if (action.action === 'replay') {
            // Fake data
            // this.state = State.Finished;
            // this.storyLength = 2;
            // this.userStories.clear();
            // this.userStories.set(this.sessions[0].id!, createDummyStory(this.sessions[0].id!, 0));
            // this.userStories.set(this.sessions[1].id!, createDummyStory(this.sessions[1].id!, 1));

            this.chatRoom.broadcast({ action: 'replay' });
            this.sendStorybook(0);

            return;
        }
        if (action.action === 'replayNextEntry') {
            const index = this.markLastStorybookEntryAsShown();
            this.sendStorybook(index);
            return;
        }
        if (action.action === 'replayBook') {
            this.sendStorybook(action.index);
            return;
        }
        if (action.action === 'story') {
            this.userInputs.set(sessionId, action.text);

            this.chatRoom.broadcast({ action: 'playersDone', count: this.userInputs.size });

            console.log('this.userInputs.size', this.userInputs.size);
            console.log('this.sessions.length', this.sessions.length);

            if (this.userInputs.size === this.sessions.length)
            {
                switch(this.state) {
                    case State.StartStory:
                        for (const [key, value] of this.userInputs.entries()) {
                            this.userStories.set(key, [{
                                userId: key,
                                userName: 'SomeUser', // this.sessions.find(s => s.id == key)!.name!,
                                text: value,
                                shown: true,
                            }]);
                        }
                        this.state = State.ContinueStory;
                        this.userInputs.clear();
                        this.storyLength = 1;
                        break;
                    case State.ContinueStory:
                        for (const [key, value] of this.userInputs.entries()) {
                            const targetId = this.userTargets.get(key)!;
                            this.userStories.get(targetId)!.push({
                                userId: key,
                                userName: 'SomeUser', // this.sessions.find(s => s.id == key)!.name!,
                                text: value,
                                shown: false,
                            });
                        }
                        this.userInputs.clear();
                        this.storyLength++;
                        break;
                }

                console.log('this.storyLength', this.storyLength);
                console.log('this.sessions.length', this.sessions.length);

                // Distribute stories randomly
                if (this.storyLength < this.sessions.length) {
                    this.chatRoom.broadcast({ action: 'nextRound', round: this.storyLength, time: new Date() });
                    this.chatRoom.broadcast({ action: 'playersDone', count: 0 });

                    this.userTargets.clear();

                    let availableStories = Array.from(this.userStories);

                    for (const session of this.sessions) {
                        let selectableStories = Array.from(availableStories);

                        // Do not add to your own story
                        selectableStories = selectableStories.filter(s => s[0] !== session.id);

                        // Do not add to stories you already added to
                        selectableStories = selectableStories.filter(s => !s[1].find(storyEntry => storyEntry.userId === session.id));

                        const selectedStory = selectRandomElement(selectableStories);
                        const [selectedStoryId, selectedStoryEntries] = selectedStory;

                        this.userTargets.set(session.id!, selectedStoryId);
                        session.webSocket.send(JSON.stringify({ action: 'previousStory', text: selectedStoryEntries[selectedStoryEntries.length-1].text }));

                        availableStories = availableStories.filter(s => s != selectedStory);
                    }
                } else {
                    this.state = State.Finished;
                    this.chatRoom.broadcast({ action: 'finished' });
                    console.log(this.userStories);
                }
            }
            return;
        }
    }
}

