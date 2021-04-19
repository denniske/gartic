import {
    HomeIcon,
    ChatAltIcon,
    BellIcon,
    HashtagIcon,
} from "@heroicons/react/outline";
import {Card} from "~/ui/Card";
import {NavLink} from "~/ui/NavLink";
import {SearchInput} from "~/ui/SearchInput";
import Example from "~/components/example";
import {faCheck, faClock, faCrown, faLink, faPlay, faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useMutate, useSelector} from "~/state/store";
import {useDispatch} from "react-redux";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {actionStory, join, actionStart} from "~/components/connection";
import {useInterval} from "~/hooks/use-interval";
import {roundTime} from "~/general.types";
import Progress from "~/components/progress";


export default function GameContinueStory() {
    const user = useSelector(state => state.user);
    const playersDone = useSelector((state) => state.playersDone);
    const players = useSelector((state) => state.players);
    const game = useSelector((state) => state.game);
    const [progress, setProgress] = useState(0);

    useInterval(() => {
        const elapsed = (new Date().getTime() - game.roundStartTime.getTime())/1000;
        setProgress(elapsed / roundTime * 100);
    }, 100);

    const [text, setText] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDone(false);
        setText(user.name + '-' + game.round);
    }, [game.round]);

    return (
        <div className="p-4 flex flex-col max-w-7xl space-y-5">


            <div className="flex flex-row items-center">
                <div className="text-gray-100">
                    <div className="text-gray-100">
                        Continue the story!
                    </div>
                    <div className="text-gray-100">
                        Round {game.round} / {players.length}
                    </div>
                </div>
                <div className="flex-1"/>
                <Progress progress={progress} size={60}/>
            </div>


            <div className="mt-1">
                <div className="bg-gray-300 shadow-sm px-3 py-2 mt-1 block w-full sm:text-sm border-gray-300 rounded-md">
                    {game.previousStoryText}
                </div>
            </div>

            <div className="mt-1">
                      <textarea
                          id="about"
                          name="about"
                          rows={3}
                          readOnly={done}
                          disabled={done}
                          className={`disabled:bg-gray-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md`}
                          placeholder="A fox jumps over a tree."
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                      />
            </div>

            <div className="flex flex-row justify-end items-center space-x-4">

                <div className="text-gray-100 justify-self-start">
                    {playersDone} / {players.length} players are done.
                </div>

                <div className="flex-1"/>

                {
                    !done &&
                    <button
                        onClick={() => {
                            setDone(true);
                            actionStory(text);
                        }}
                        className="inline-flex justify-center items-center py-2 px-4 border border-transparent button-shadow text-sm font-medium rounded-md text-white bg-white hover:bg-gray-300"
                    >
                        <FontAwesomeIcon className="text-green-500 text-shadow" icon={faCheck}/>
                        <span className="px-4 font-bold uppercase text-purple-900">
                            Done
                        </span>
                    </button>
                }
                {
                    done &&
                    <button
                        onClick={() => setDone(false)}
                        className="inline-flex justify-center items-center py-2 px-4 border border-transparent button-shadow text-sm font-medium rounded-md text-white bg-white hover:bg-gray-300"
                    >
                        <FontAwesomeIcon className="text-green-500 text-shadow" icon={faCheck}/>
                        <span className="px-4 font-bold uppercase text-purple-900">
                            Edit
                        </span>
                    </button>
                }
            </div>

        </div>
    );
}
