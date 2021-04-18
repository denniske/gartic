import {ChatRoom, ISession} from "./chat-room";

interface IStoryEntry {
    userId: string;
    userName: string;
    text: string;
}

interface IStoryAction {
    action: 'story';
    text: string;
}

interface IStartAction {
    action: 'start';
}

type Action = IStoryAction | IStartAction;

enum State {
    StartStory = 'START_STORY',
    ContinueStory = 'CONTINUE_STORY',
    Finished = 'FINISHED',
}

function selectRandomElement<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
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

    processAction(session: ISession, action: Action) {
        console.log();
        console.log('STATE', this.state);
        console.log('STORY LENGTH', this.storyLength);
        console.log('PROCESS', action.action);
        if (action.action === 'start') {
            this.state = State.StartStory;
            this.storyLength = 0;
            this.userStories.clear();
            this.userInputs.clear();
            this.userTargets.clear();
            this.chatRoom.broadcast({ action: 'start' });
            return;
        }
        if (action.action === 'story') {
            this.userInputs.set(session.id!, action.text);

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
                                userName: this.sessions.find(s => s.id == key)!.name!,
                                text: value,
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
                                userName: this.sessions.find(s => s.id == key)!.name!,
                                text: value,
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
                    this.chatRoom.broadcast({ action: 'nextRound', round: this.storyLength });
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

