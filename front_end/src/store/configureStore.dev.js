import Raven from "raven-js";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import createRavenMiddleware from "raven-for-redux";
import { createStore, applyMiddleware, compose } from "redux";

import rootReducer from "reducers";
import { loadState } from "store/localStorage";

const logger = createLogger();
const createStoreWithMiddleware = applyMiddleware(logger)(createStore);
const persistedState = loadState();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

Raven.config("https://e4324708c61040909daaed217fc879f5@sentry.io/1258839").install();

export default function configureStore() {
  return createStoreWithMiddleware(
    rootReducer,
    persistedState,
    composeEnhancers(applyMiddleware(thunk, createRavenMiddleware(Raven, {})))
  );
}
