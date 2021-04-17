import "../../styles/globals.css";
import {useEffect} from "react";
import {initConnection} from "~/components/connection";

function MyApp({ Component, pageProps }) {

  console.log(1);
  useEffect(() => {
    console.log(2);
    initConnection();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
