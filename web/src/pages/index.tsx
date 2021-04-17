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
import {faClock, faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useMutate, useSelector} from "~/state/store";
import {useDispatch} from "react-redux";


export default function Home() {
    const players = useSelector((state) => state.players);
    const count = useSelector((state) => state.count);
    const mutate = useMutate()
    const dispatch = useDispatch()
    const increment = () =>
        dispatch({
            type: 'INCREMENT',
        });


    const playerList = Array.from({length: 10}, (_, i) => players.length > i ? players[i] : null);

    // <div className="bg-purple-800 p-4 flex md:flex-row flex-col min-h-screen max-w-7xl mx-auto space-y-3">
    return (
        <div className="p-4 flex md:flex-row flex-col max-w-7xl mx-auto space-y-3">

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

            <div className="flex-auto bg-purple-900 rounded-xl p-4 space-y-3">

                <div className="flex justify-center">
                    <div className="uppercase text-green-400 text-3xl font-bold text-shadow" onClick={increment}>
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

        </div>
    );
}
