import { useMemo } from 'react'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { TypedUseSelectorHook, useDispatch, useSelector as useReduxSelector } from 'react-redux';
import {produce} from "immer";
import {AppState, initialState} from "~/state/action";


export const useSelector: TypedUseSelectorHook<AppState> = useReduxSelector

let store


export const EXEC = 'EXEC'

export function exec(mutation: StateMutation) {
    return {
        type: EXEC,
        mutation
    }
}

export type StateMutation = (state: AppState) => void;

export function useMutate() {
    const dispatch = useDispatch()
    return (m: StateMutation) => dispatch(exec(m));
}

interface IAction {
    type: string;
    mutation?: any;
}

function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        case EXEC:
            return produce(state, action.mutation);
        default:
            return state
    }
}



function initStore(preloadedState = initialState) {
    return createStore(
        reducer,
        preloadedState,
        composeWithDevTools(applyMiddleware())
    )
}

export const initializeStore = (preloadedState) => {
    let _store = store ?? initStore(preloadedState)

    // After navigating to a page with an initial Redux state, merge that state
    // with the current state in the store, and create a new store
    if (preloadedState && store) {
        _store = initStore({
            ...store.getState(),
            ...preloadedState,
        })
        // Reset the current store
        store = undefined
    }

    // For SSG and SSR always create a new store
    if (typeof window === 'undefined') return _store
    // Create the store once in the client
    if (!store) store = _store

    return _store
}

export function useStore(initialState) {
    const store = useMemo(() => initializeStore(initialState), [initialState])
    return store
}
