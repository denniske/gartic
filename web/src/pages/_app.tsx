import "../../styles/globals.css";
import {useEffect, useState} from "react";
import {initConnection} from "~/components/connection";
import {useMutate, useSelector, useStore} from "~/state/store";
import {Provider} from "react-redux";
import Alert from "~/components/alert";
import {closeReasonKicked} from "~/client/lobby-client";
import {updateUser} from "~/state/action";

function ConnectionHandler({ children }: any) {
    const mutate = useMutate();

    // useEffect(() => {
    //     initConnection(mutate);
    // }, []);

    const connectionLost = useSelector(state => state.connectionLost);
    const connectionLostReason = useSelector(state => state.connectionLostReason);

    const [open, setOpen] = useState(false);

    return (
        <div>
            <Alert
                open={!!connectionLost && connectionLostReason != closeReasonKicked}
                title="Connection lost."
                text="The connection to the server has been lost."
                action="Close"
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
