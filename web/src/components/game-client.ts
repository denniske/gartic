import {Mutate} from "~/state/store";
import {IStorybook} from "~/general.types";
import {returnToLobby} from "~/state/action";

interface IPreviousStoryAction {
    action: 'previousStory';
    text: string;
}

interface INextRoundAction {
    action: 'nextRound';
    round: number;
    time: string;
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
    time: string;
}

interface IReplayAction {
    action: 'replay';
}

interface IStorybookAction {
    action: 'storybook';
    storybook: IStorybook;
}

interface IRestartAction {
    action: 'restart';
}

type Action = IStartAction | INextRoundAction | IPreviousStoryAction | IFinishedAction | IPlayersDoneAction | IReplayAction | IStorybookAction | IRestartAction;

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
                state.game.roundStartTime = new Date(action.time);
            });
            return;
        }

        if (action.action === 'nextRound') {
            this.state = State.ContinueStory;
            this.mutate((state) => {
                state.game.screen = 'continueStory';
                state.game.round = action.round;
                state.game.roundStartTime = new Date(action.time);
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

        if (action.action === 'replay') {
            this.state = State.Finished;
            this.mutate((state) => {
                state.game.screen = 'replay';
            });
            return;
        }

        if (action.action === 'restart') {
            this.mutate(returnToLobby());
            return;
        }

        if (action.action === 'playersDone') {
            this.mutate((state) => {
                state.playersDone = action.count;
            });
            return;
        }

        if (action.action === 'storybook') {
            this.mutate((state) => {
                state.replay.storybook = action.storybook;
            });
            return;
        }
    }
}
