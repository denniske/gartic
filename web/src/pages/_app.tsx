import "../../styles/globals.css";
import {useEffect, useState} from "react";
import {initConnection} from "~/components/connection";
import {useMutate, useSelector, useStore} from "~/state/store";
import {Provider} from "react-redux";
import Alert from "~/components/alert";
import {closeReasonKicked, closeReasonLeft, closeReasonLeft2} from "~/client/lobby-client";
import {updateUser} from "~/state/action";

function ConnectionHandler({ children }: any) {
    const mutate = useMutate();

    // useEffect(() => {
    //     initConnection(mutate);
    // }, []);

    const error = useSelector(state => state.error);
    const connectionLost = useSelector(state => state.connectionLost);
    const connectionLostReason = useSelector(state => state.connectionLostReason);
    const closeReasonUnknown = ![closeReasonKicked, closeReasonLeft, closeReasonLeft2].includes(connectionLostReason);

    const [open, setOpen] = useState(false);

    return (
        <div>
            <Alert
                open={!!connectionLost && closeReasonUnknown}
                title="Connection lost."
                text="The connection to the server has been lost."
                action="Return to Home"
                onActionClick={() => {
                    mutate(state => {
                        state.connectionLost = undefined;
                        state.connectionLostReason = undefined;
                    });
                    mutate(updateUser({id: undefined, name: undefined}));
                }}
            />
            <Alert
                open={!!connectionLost && connectionLostReason == closeReasonKicked}
                title="You were kicked."
                text="The host has kicked you from the lobby."
                action="Close"
                onActionClick={() => mutate(state => {
                    state.connectionLost = undefined;
                    state.connectionLostReason = undefined;
                })}
            />
            <Alert
                open={!!error}
                title="Error"
                text="An error occured."
                action="Close"
                onActionClick={() => mutate(state => {
                    state.error = undefined;
                })}
            />

            {children}
        </div>
    );
}

function MyApp({Component, pageProps}) {
    const store = useStore(pageProps.initialReduxState)

    return (
        <Provider store={store}>
            <ConnectionHandler>
                <Component {...pageProps} />
            </ConnectionHandler>
        </Provider>
    )
}

export default MyApp;
