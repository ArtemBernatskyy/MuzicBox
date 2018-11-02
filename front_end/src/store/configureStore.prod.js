import Raven from 'raven-js';
import thunk from 'redux-thunk';
import throttle from 'lodash/throttle';
import createRavenMiddleware from 'raven-for-redux';
import { applyMiddleware, createStore } from 'redux';

import rootReducer from 'reducers';
import { loadState, saveState } from 'store/localStorage';

export default function configureStore() {
  Raven.config('https://666cbcf624ac42a6936a96f8507dbf5e@sentry.io/1259461').install();
  const persistedState = loadState();
  const ravenMiddleware = createRavenMiddleware(Raven);

  const middlewares = [thunk, ravenMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const store = createStore(rootReducer, persistedState, middlewareEnhancer);
  store.subscribe(
    throttle(() => {
      const currentState = store.getState();
      // if we allowing state to sync with localStorage
      if (currentState.isStorageSync) {
        saveState(currentState);
      }
    }, 2000),
  );
  return store;
}
