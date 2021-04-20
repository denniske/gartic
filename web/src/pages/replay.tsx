import {faArrowRight, faPlay} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useMutate, useSelector} from "~/state/store";
import {actionReplayBook, actionReplayNextEntry, actionRestart} from "~/components/connection";


export default function Replay() {
    const mutate = useMutate();
    const user = useSelector(state => state.user);
    const storybook = useSelector(state => state.replay.storybook);

    if (!storybook) {
        return <div/>;
    }

    const storybookComplete = storybook.entries.every(e => e.shown);

    return (
        <div className="p-4 flex flex-col max-w-7xl space-y-5">

            <div className="text-gray-100">
                Storybook for {storybook.user.name}
            </div>

            {
                storybook.entries.map((entry, i) => (
                    <div className="mt-1" key={i}>
                        <div className="text-gray-300">
                            {entry.userName}
                        </div>
                        <div className="bg-gray-300 shadow-sm px-3 py-2 mt-1 block w-full sm:text-sm border-gray-300 rounded-md">
                            {
                                entry.shown &&
                                <div>
                                    {
                                        entry.text &&
                                        <span>{entry.text}</span>
                                    }
                                    {
                                        !entry.text &&
                                        <div className="inline-block uppercase rounded-md px-2 py-1 bg-gray-200 border-gray-500 text-gray-500">
                                            Empty
                                        </div>
                                    }
                                </div>
                            }
                            {
                                !entry.shown && user.admin &&
                                <button
                                    onClick={() => actionReplayNextEntry()}
                                    className="inline-flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-white hover:bg-gray-100"
                                >
                                    <span className="px-4 font-bold uppercase text-purple-900">
                                        Show
                                    </span>
                                </button>
                            }
                            {
                                !entry.shown && !user.admin &&
                                <span>???</span>
                            }
                        </div>
                    </div>
                ))
            }

            {
                user.admin && storybookComplete && !storybook.last &&
                <div className="flex flex-row justify-end space-x-4">
                    <button
                        onClick={() => actionReplayBook(storybook.index+1)}
                        className="inline-flex justify-center items-center py-2 px-4 border border-transparent button-shadow text-sm font-medium rounded-md text-white bg-white hover:bg-gray-300"
                    >
                        <FontAwesomeIcon className="text-green-500 text-shadow" icon={faArrowRight}/>
                        <span className="px-4 font-bold uppercase text-purple-900">
                            Next
                        </span>
                    </button>
                </div>
            }
            {
                user.admin && storybookComplete && storybook.last &&
                <div className="flex flex-row justify-end space-x-4">
                    <button
                        onClick={() => actionRestart()}
                        // onClick={() => mutate(returnToLobby())}
                        className="inline-flex justify-center items-center py-2 px-4 border border-transparent button-shadow text-sm font-medium rounded-md text-white bg-white hover:bg-gray-300"
                    >
                        <FontAwesomeIcon className="text-green-500 text-shadow" icon={faPlay}/>
                        <span className="px-4 font-bold uppercase text-purple-900">
                            New Round
                        </span>
                    </button>
                </div>
            }

        </div>
    );
}
