import '../styles/globals.css';
import React from "react";
import {Provider} from "react-redux";
import {store} from "../redux/store";
import Modal from "react-modal";

Modal.setAppElement('#__next');

function MyApp({Component, pageProps}) {
    return (
        <React.StrictMode>
            <Provider store={store}>
                <Component {...pageProps} />
            </Provider>
        </React.StrictMode>
    )
}

export default MyApp;
