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
import {actionStory, lobbyJoin, actionStart, actionReplay} from "~/components/connection";


export default function GameFinished() {
    const user = useSelector(state => state.user);
    const config = useSelector(state => state.config);

    return (
        <div className="p-4 flex flex-col max-w-7xl space-y-5">

            <div className="text-gray-100">
                The stories are finished!
            </div>

            {
                user.admin &&
                <div className="flex flex-row justify-end space-x-4">
                    <button
                        onClick={() => actionReplay()}
                        className="inline-flex justify-center items-center py-2 px-4 border border-transparent button-shadow text-sm font-medium rounded-md text-white bg-white hover:bg-gray-300"
                    >
                        <FontAwesomeIcon className="text-green-500 text-shadow" icon={faPlay}/>
                        <span className="px-4 font-bold uppercase text-purple-900">
                            Show stories
                        </span>
                    </button>
                </div>
            }
        </div>
    );
}
