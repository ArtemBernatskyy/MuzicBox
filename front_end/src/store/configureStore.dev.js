import Raven from 'raven-js';
import thunk from 'redux-thunk';
import throttle from 'lodash/throttle';
import { createLogger } from 'redux-logger';
import { applyMiddleware, createStore } from 'redux';
import createRavenMiddleware from 'raven-for-redux';
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from 'reducers';
import { loadState, saveState } from 'store/localStorage';

export default function configureStore() {
  Raven.config('https://e4324708c61040909daaed217fc879f5@sentry.io/1258839').install();
  const persistedState = loadState();
  const loggerMiddleware = createLogger();
  const ravenMiddleware = createRavenMiddleware(Raven);

  const middlewares = [thunk, loggerMiddleware, ravenMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer];
  const composedEnhancers = composeWithDevTools(...enhancers);

  const store = createStore(rootReducer, persistedState, composedEnhancers);
  store.subscribe(
    throttle(() => {
      saveState(store.getState());
    }, 1000),
  );
  return store;
}
