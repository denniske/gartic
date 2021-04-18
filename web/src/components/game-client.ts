import {Mutate} from "~/state/store";

interface IPreviousStoryAction {
    action: 'previousStory';
    text: string;
}

interface INextRoundAction {
    action: 'nextRound';
    round: number;
}

interface IFinishedAction {
    action: 'finished';
}

interface IPlayersDoneAction {
    action: 'playersDone';
    count: number;
}

interface IStartAction {
    action: 'start';
}

type Action = IStartAction | INextRoundAction | IPreviousStoryAction | IFinishedAction | IPlayersDoneAction;

enum State {
    StartStory,
    ContinueStory,
    Finished,
}

export class GameClient {
    state: State = State.StartStory;

    constructor(private mutate: Mutate) { }

    processActionFromServer(action: Action) {
        if (action.action === 'start') {
            this.mutate((state) => {
                state.game.screen = 'startStory';
            });
            return;
        }

        if (action.action === 'nextRound') {
            this.state = State.ContinueStory;
            this.mutate((state) => {
                state.game.screen = 'continueStory';
                state.game.round = action.round;
            });
            return;
        }

        if (action.action === 'previousStory') {
            this.mutate((state) => {
                state.game.previousStoryText = action.text;
            });
            return;
        }

        if (action.action === 'finished') {
            this.state = State.Finished;
            this.mutate((state) => {
                state.game.screen = 'finished';
            });
            return;
        }

        if (action.action === 'playersDone') {
            this.mutate((state) => {
                state.playersDone = action.count;
            });
            return;
        }
    }
}
