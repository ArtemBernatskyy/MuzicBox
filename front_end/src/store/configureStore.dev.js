import Raven from "raven-js";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import createRavenMiddleware from "raven-for-redux";
import { createStore, applyMiddleware } from "redux";

import rootReducer from "reducers";

const logger = createLogger();
const createStoreWithMiddleware = applyMiddleware(logger)(createStore);

Raven.config("https://e4324708c61040909daaed217fc879f5@sentry.io/1258839").install();

export default function configureStore() {
  return createStoreWithMiddleware(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk, createRavenMiddleware(Raven, {}))
  );
}
