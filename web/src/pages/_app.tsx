import "../../styles/globals.css";
import {useEffect} from "react";
import {initConnection} from "~/components/connection";
import {useMutate, useStore} from "~/state/store";
import {Provider} from "react-redux";

function ConnectionHandler({ children }: any) {
    const mutate = useMutate();

    useEffect(() => {
        initConnection(mutate);
    }, []);

    return children;
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
