
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

    const strokeDashoffset = -clamp(progress, 0, 100) / 100 * circumference;

    return (
        <svg
            height={size}
            width={size}
            style={{transform: 'rotate(-90deg)'}}
        >
            <circle
                stroke={progress < 80 ? 'white' : '#F7B500'}
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
                strokeWidth={ '2.5px' }
                r={ size/4+4 }
                cx={ size/2 }
                cy={ size/2 }
            />
        </svg>
    );
}


// export default function Progress(props: Props) {
//     const { size, progress } = props;
//
//     const normalizedRadius = size/8;
//     const circumference = normalizedRadius * 2 * Math.PI;
//
//     const strokeDashoffset = circumference - clamp(progress, 0, 100) / 100 * circumference;
//
//     return (
//         <svg
//             height={size}
//             width={size}
//         >
//             <circle
//                 stroke="white"
//                 fill="transparent"
//                 strokeDasharray={ circumference + ' ' + circumference }
//                 style={ { strokeDashoffset } }
//                 strokeWidth={ size/4 + 'px' }
//                 r={ size/8 }
//                 cx={ size/2 }
//                 cy={ size/2 }
//             />
//             <circle
//                 stroke="white"
//                 fill="transparent"
//                 strokeWidth={ '2px' }
//                 r={ size/4+5 }
//                 cx={ size/2 }
//                 cy={ size/2 }
//             />
//         </svg>
//     );
// }
