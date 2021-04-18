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
import {actionStory, join, actionStart, initConnection} from "~/components/connection";


export default function Landing() {
    const router = useRouter();
    const connected = useSelector(state => state.connected);
    const user = useSelector(state => state.user);
    const [placeholderName, setPlaceholderName] = useState('');
    const [name, setName] = useState('');
    const mutate = useMutate();

    useEffect(() => {
        setPlaceholderName(`CoolName${Math.floor(Math.random() * 9999)}`);
    }, []);

    useEffect(() => {
        if (connected) {
            join(name || placeholderName);
        }
    }, [connected]);

    const code = router.query?.code as string;

    const init = () => {
        const gameCode = code || Math.floor(Math.random() * 9999).toString();
        mutate(state => {
            state.code = gameCode;
        });
        initConnection(mutate, gameCode);
    };

    return (
        <div className="p-4 flex md:flex-row flex-col max-w-7xl space-y-5">

            {
                code &&
                <div className="text-gray-100 uppercase">
                    Du wurdest eingeladen, einem Raum ({code}) beizutreten!
                </div>
            }

            <div className="mt-1">
                <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    autoComplete="given-name"
                    className="px-3 py-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder={placeholderName}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="flex flex-row justify-center space-x-4">
                {
                    code &&
                    <button
                        onClick={init}
                        className="inline-flex justify-center items-center py-2 px-4 border border-transparent button-shadow text-sm font-medium rounded-md text-white bg-white hover:bg-gray-300"
                    >
                        <FontAwesomeIcon className="text-green-500 text-shadow" icon={faPlay}/>
                        <span className="px-4 font-bold uppercase text-purple-900">
                            Join
                        </span>
                    </button>
                }
                {
                    !code &&
                    <button
                        onClick={init}
                        className="inline-flex justify-center items-center py-2 px-4 border border-transparent button-shadow text-sm font-medium rounded-md text-white bg-white hover:bg-gray-300"
                    >
                        <FontAwesomeIcon className="text-green-500 text-shadow" icon={faPlay}/>
                        <span className="px-4 font-bold uppercase text-purple-900">
                            Start
                        </span>
                    </button>
                }
            </div>

        </div>
    );
}
