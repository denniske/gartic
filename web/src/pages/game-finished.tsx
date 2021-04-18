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


export default function GameFinished() {
    const user = useSelector(state => state.user);
    const [text, setText] = useState(user.name + '0');
    const [done, setDone] = useState(false);
    const playersDone = useSelector((state) => state.playersDone);
    const players = useSelector((state) => state.players);

    return (
        <div className="p-4 flex md:flex-row flex-col max-w-7xl space-y-5">

            <div className="text-gray-100">
                The stories are finished!
            </div>

        </div>
    );
}
