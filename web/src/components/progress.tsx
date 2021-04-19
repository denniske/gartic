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
import {actionStory, lobbyJoin, actionStart, initConnection} from "~/components/connection";
import {speak} from "~/components/speech";

interface Props {
    progress: number;
    size: number;
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export default function Progress(props: Props) {
    const { size, progress } = props;

    const normalizedRadius = size/8;
    const circumference = normalizedRadius * 2 * Math.PI;

    const strokeDashoffset = circumference - clamp(progress, 0, 100) / 100 * circumference;

    return (
        <svg
            height={size}
            width={size}
        >
            <circle
                stroke="white"
                fill="transparent"
                strokeDasharray={ circumference + ' ' + circumference }
                style={ { strokeDashoffset } }
                strokeWidth={ size/4 + 'px' }
                r={ size/8 }
                cx={ size/2 }
                cy={ size/2 }
            />
            <circle
                stroke="white"
                fill="transparent"
                strokeWidth={ '2px' }
                r={ size/4+5 }
                cx={ size/2 }
                cy={ size/2 }
            />
        </svg>
    );
}
