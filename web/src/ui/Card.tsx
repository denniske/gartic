import {
    DotsHorizontalIcon,
    HeartIcon,
    ReplyIcon,
    ShareIcon,
    SwitchHorizontalIcon,
} from "@heroicons/react/outline";
import {TweetAction} from "~/ui/TweetAction";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCrown, faTimes} from "@fortawesome/free-solid-svg-icons";
import {IPlayer} from "~/general.types";
import {useSelector} from "~/state/store";
import {lobbyKick} from "~/components/connection";


interface Props {
    player: IPlayer;
}




export function Card(props: Props) {
    const config = useSelector(state => state.config);
    const user = useSelector(state => state.user);
    const { player } = props;

    if (player == null) {
        return (
            <div
                className="rounded-l-[35px] rounded-r-xl bg-purple-700 border-2 border-purple-500 flex items-center px-3 py-2 space-x-4">
                <div>
                    <div className="bg-purple-500 rounded-full h-12 w-12"/>
                </div>
                <div className="flex-1 font-bold uppercase text-purple-500 text-base">
                    {'EMPTY'}
                </div>
            </div>
        );
    }

    return (
        <div
            className="rounded-l-[35px] rounded-r-xl bg-gray-300 border-2 border-gray-300 flex items-center px-3 py-2 space-x-4">
            <div>
                <div className="bg-blue-500 rounded-full h-12 w-12"/>
            </div>
            <div className="flex-1 font-bold uppercase text-purple-900 text-base">
                {player?.name ?? 'EMPTY'}
            </div>
            {
                user.admin && !player.admin &&
                <div
                    onClick={() => lobbyKick(player.id)}
                    className="cursor-pointer border-2 border-purple-800 rounded-full h-8 w-8 flex items-center justify-center hover:bg-purple-800 text-purple-800 hover:text-gray-300">
                    <FontAwesomeIcon icon={faTimes}/>
                </div>
            }
            {
                player.admin &&
                <div className="bg-purple-800 rounded-full h-8 w-8 flex items-center justify-center text-gray-300">
                    <FontAwesomeIcon icon={faCrown}/>
                </div>
            }
        </div>
    );
}
