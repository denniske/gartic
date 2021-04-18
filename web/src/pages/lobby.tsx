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
import {faChevronLeft, faClock, faCrown, faLink, faPlay, faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useMutate, useSelector} from "~/state/store";
import {useDispatch} from "react-redux";
import {useRouter} from "next/router";
import {useEffect} from "react";
import {join, actionStart, quit} from "~/components/connection";


export default function Lobby() {
    const router = useRouter();
    const players = useSelector((state) => state.players);
    const connected = useSelector((state) => state.connected);
    const code = useSelector((state) => state.code);

    const playerList = Array.from({length: 10}, (_, i) => players.length > i ? players[i] : null);

    const leaveGame = () => {
        quit();
    };

    // <div className="bg-purple-800 p-4 flex md:flex-row flex-col min-h-screen max-w-7xl mx-auto space-y-3">
    return (
        <div className="space-y-5">

            {/*<div className="flex-1 bg-purple-900 rounded-xl p-4 space-y-3">*/}

            {/*    <div className="flex justify-center">*/}
            {/*        <div className="uppercase text-green-400 text-3xl font-bold text-shadow">*/}
            {/*            Settings*/}
            {/*        </div>*/}
            {/*    </div>*/}

            {/*    <div className="text-gray-300">*/}
            {/*        <FontAwesomeIcon icon={faClock}/> Time*/}
            {/*    </div>*/}

            {/*    <Example/>*/}

            {/*</div>*/}

            <div className="flex flex-row items-center">
                <button
                    onClick={leaveGame}
                    className="inline-flex justify-center items-center bg-purple-900 border-2 border-gray-300 rounded-xl py-2 px-4"
                >
                    <FontAwesomeIcon className="text-gray-300 text-shadow" icon={faChevronLeft}/>
                    <span className="px-4 font-bold uppercase text-gray-300">
                        Leave ({code})
                    </span>
                </button>
            </div>

            <div className="flex-auto bg-purple-900 rounded-xl p-4 space-y-3">

                <div className="flex justify-center">
                    <div className="uppercase text-green-400 text-3xl font-bold">
                        Players {players.length}/{playerList.length}
                    </div>
                </div>

                <div className="space-y-3">
                    {
                        playerList.map((player, i) =>
                            <Card key={i} player={player}/>
                        )
                    }
                </div>

            </div>

            <div className="flex flex-row justify-center space-x-4">
                <button
                    className="inline-flex justify-center items-center py-2 px-4 border border-transparent button-shadow text-sm font-medium rounded-md text-white bg-white hover:bg-gray-300"
                >
                    <FontAwesomeIcon className="text-green-500 text-shadow" icon={faLink}/>
                    <span className="px-4 font-bold uppercase text-purple-900">
                        Invite
                    </span>
                </button>
                <button
                    onClick={() => actionStart()}
                    className="inline-flex justify-center items-center py-2 px-4 border border-transparent button-shadow text-sm font-medium rounded-md text-white bg-white hover:bg-gray-300"
                >
                    <FontAwesomeIcon className="text-green-500 text-shadow" icon={faPlay}/>
                    <span className="px-4 font-bold uppercase text-purple-900">
                        Start
                    </span>
                </button>
            </div>

        </div>
    );
}
