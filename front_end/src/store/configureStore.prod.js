import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import rootReducer from "reducers";

const createStoreWithMiddleware = applyMiddleware()(createStore);

export default function configureStore() {
  return createStoreWithMiddleware(rootReducer, applyMiddleware(thunk));
}
