import {useEffect} from 'react';


export function useKeyUp(onKeyUp: (event: KeyboardEvent) => void, deps: any[]) {
    useEffect(() => {
        document.addEventListener('keyup', onKeyUp);
        return () => {
            document.removeEventListener('keyup', onKeyUp);
        };
    }, deps);
}
