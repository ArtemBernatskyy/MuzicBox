import Raven from "raven-js";
import thunk from "redux-thunk";
import createRavenMiddleware from "raven-for-redux";
import { createStore, applyMiddleware } from "redux";

import rootReducer from "reducers";
import { loadState } from "store/localStorage";

const createStoreWithMiddleware = applyMiddleware()(createStore);
const persistedState = loadState();

Raven.config("https://666cbcf624ac42a6936a96f8507dbf5e@sentry.io/1259461").install();

export default function configureStore() {
  return createStoreWithMiddleware(
    rootReducer,
    persistedState,
    applyMiddleware(thunk, createRavenMiddleware(Raven, {}))
  );
}
