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

export default function Home() {
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
                    <div className="uppercase text-green-400 text-3xl font-bold text-shadow">
                        Players 1/10
                    </div>
                </div>

                <div className="space-y-3">
                    {Array.from({length: 5}, (_, i) => (
                        <Card key={i}/>
                    ))}
                </div>

            </div>

        </div>
    );
}
